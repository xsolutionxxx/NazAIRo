import Stripe from "stripe";
import prisma from "../shared/lib/prisma-db.js";
import ApiError from "../exceptions/api-error.js";
import mailService from "./mail-service.js";
import pdfService from "./pdf-service.js";
import logger from "../shared/lib/logger.js";

// Lazy Stripe — key might not be in env during tests/startup
let _stripe = null;
const stripe = new Proxy({}, {
  get(_, prop) {
    if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return _stripe[prop];
  },
});

class BookingService {
  // ─── Create PaymentIntent + pending Booking ─────────────────────────────────
  async initiateFlightBooking(userId, { flightId, passengers, cabinClass }) {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: { airline: true, departureAirport: true, arrivalAirport: true },
    });

    if (!flight) throw ApiError.NotFound("Flight not found");
    if (flight.availableSeats < passengers.length)
      throw ApiError.BadRequest("Not enough seats available");

    const totalPrice = Number(flight.price) * passengers.length;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    logger.info(`[booking] initiateFlightBooking userId=${userId} stripeCustomerId=${user?.stripeCustomerId ?? "none"}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
      ...(user?.stripeCustomerId ? { customer: user.stripeCustomerId } : {}),
      metadata: {
        userId,
        flightId,
        passengerCount: String(passengers.length),
      },
    });

    // Reserve seats + create pending booking atomically.
    // availableSeats is decremented here so no other user can book the same seats
    // while payment is in progress. Seats are restored if payment is abandoned/fails.
    const [, booking] = await prisma.$transaction([
      prisma.flight.update({
        where: { id: flightId, availableSeats: { gte: passengers.length } },
        data: { availableSeats: { decrement: passengers.length } },
      }),
      prisma.booking.create({
      data: {
        userId,
        type: "FLIGHT",
        status: "PENDING",
        totalPrice,
        currency: "USD",
        stripePaymentIntentId: paymentIntent.id,
        flightBooking: {
          create: {
            flightId,
            seatCount: passengers.length,
            cabinClass: cabinClass ?? flight.cabinClass,
            passengers: {
              create: passengers.map((p) => ({
                title: p.title ?? null,
                firstName: p.firstName,
                lastName: p.lastName,
                dateOfBirth: new Date(p.dateOfBirth),
                passportNumber: p.passportNumber,
                passportExpiry: p.passportExpiry ? new Date(p.passportExpiry) : null,
                nationality: p.nationality,
                seatNumber: p.seatNumber ?? null,
              })),
            },
          },
        },
      },
      include: {
        flightBooking: { include: { flight: { include: { airline: true, departureAirport: true, arrivalAirport: true } }, passengers: true } },
      },
    }),
    ]);

    return {
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      totalPrice,
      booking,
    };
  }

  // ─── Confirm booking after successful payment ────────────────────────────────
  async confirmBooking(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightBooking: { include: { flight: true } },
        hotelBooking:  true,
      },
    });

    if (!booking) throw ApiError.NotFound("Booking not found");
    if (booking.userId !== userId) throw ApiError.Forbidden();

    const paymentIntent = await stripe.paymentIntents.retrieve(
      booking.stripePaymentIntentId,
    );

    if (paymentIntent.status !== "succeeded")
      throw ApiError.BadRequest("Payment not completed");

    // Build operations list based on booking type
    const ops = [
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
        include: {
          flightBooking: {
            include: {
              flight: { include: { airline: true, departureAirport: true, arrivalAirport: true } },
              passengers: true,
            },
          },
          hotelBooking: {
            include: { room: { include: { hotel: true } }, guests: true },
          },
          payment: true,
        },
      }),
      prisma.payment.create({
        data: {
          bookingId,
          stripePaymentIntentId: booking.stripePaymentIntentId,
          stripeChargeId: paymentIntent.latest_charge,
          amount: booking.totalPrice,
          currency: booking.currency,
          status: "PAID",
          paidAt: new Date(),
        },
      }),
    ];

    // Seats were already reserved at initiateFlightBooking — no decrement needed here

    const [confirmed] = await prisma.$transaction(ops);

    // Send confirmation email with PDF ticket (non-blocking)
    this._sendConfirmationEmail(confirmed).catch((e) =>
      logger.error("[booking] Failed to send confirmation email", { bookingId, stack: e.stack }),
    );

    return confirmed;
  }

  async _sendConfirmationEmail(booking) {
    const user = await prisma.user.findUnique({ where: { id: booking.userId }, select: { email: true } });
    if (!user) return;

    let details = "";
    let pdfBuffer = null;

    if (booking.type === "FLIGHT" && booking.flightBooking) {
      const { flight, passengers } = booking.flightBooking;
      const dep = flight?.departureAirport?.iata ?? "";
      const arr = flight?.arrivalAirport?.iata ?? "";
      const date = flight?.departureTime ? new Date(flight.departureTime).toDateString() : "";
      details = `${dep} → ${arr} on ${date} · ${passengers?.length ?? 1} passenger(s)`;
      try {
        const doc = pdfService.generateFlightTicket(booking);
        pdfBuffer = await pdfService.toBuffer(doc);
      } catch (e) {
        logger.warn("[booking] PDF generation failed for email", { stack: e.stack });
      }
    } else if (booking.type === "HOTEL" && booking.hotelBooking) {
      const { room, checkIn, checkOut } = booking.hotelBooking;
      const hotelName = room?.hotel?.name ?? "Hotel";
      details = `${hotelName} · ${new Date(checkIn).toDateString()} – ${new Date(checkOut).toDateString()}`;
      try {
        const doc = pdfService.generateHotelVoucher(booking);
        pdfBuffer = await pdfService.toBuffer(doc);
      } catch (e) {
        logger.warn("[booking] PDF generation failed for email", { stack: e.stack });
      }
    }

    await mailService.sendBookingConfirmation(
      user.email,
      {
        bookingId: booking.id,
        type: booking.type,
        details,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
      },
      pdfBuffer,
    );
  }

  // ─── Create Hotel Booking ────────────────────────────────────────────────────
  async initiateHotelBooking(userId, { roomId, checkIn, checkOut, guestCount, guests }) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hotel: true },
    });
    if (!room) throw ApiError.NotFound("Room not found");
    if (!room.isAvailable) throw ApiError.BadRequest("Room is not available");

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) throw ApiError.BadRequest("Check-out must be after check-in");

    // Check for date conflicts
    const conflict = await prisma.hotelBooking.findFirst({
      where: {
        roomId,
        booking: { status: "CONFIRMED" },
        AND: [
          { checkIn:  { lt: new Date(checkOut) } },
          { checkOut: { gt: new Date(checkIn)  } },
        ],
      },
    });
    if (conflict) throw ApiError.BadRequest("Room is already booked for these dates");

    const roomRate   = Number(room.pricePerNight) * nights;
    const taxes      = Math.round(roomRate * 0.12);
    const cleanFee   = 25;
    const totalPrice = roomRate + taxes + cleanFee;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
      ...(user?.stripeCustomerId ? { customer: user.stripeCustomerId } : {}),
      metadata: { userId, roomId, hotelId: room.hotelId, nights: String(nights) },
    });

    const booking = await prisma.booking.create({
      data: {
        userId,
        type: "HOTEL",
        status: "PENDING",
        totalPrice,
        currency: "USD",
        stripePaymentIntentId: paymentIntent.id,
        hotelBooking: {
          create: {
            roomId,
            checkIn:  new Date(checkIn),
            checkOut: new Date(checkOut),
            guestCount,
            guests: {
              create: guests.map((g) => ({
                firstName:      g.firstName,
                lastName:       g.lastName,
                dateOfBirth:    g.dateOfBirth ? new Date(g.dateOfBirth) : null,
                passportNumber: g.passportNumber ?? null,
                nationality:    g.nationality   ?? null,
              })),
            },
          },
        },
      },
      include: {
        hotelBooking: { include: { room: { include: { hotel: true } }, guests: true } },
      },
    });

    return { bookingId: booking.id, clientSecret: paymentIntent.client_secret, totalPrice, booking };
  }

  // ─── Get user bookings ───────────────────────────────────────────────────────
  async getUserBookings(userId) {
    return prisma.booking.findMany({
      where: { userId, status: { not: "PENDING" } },
      orderBy: { createdAt: "desc" },
      include: {
        flightBooking: {
          include: {
            flight: { include: { airline: true, departureAirport: true, arrivalAirport: true } },
            passengers: true,
          },
        },
        hotelBooking: {
          include: { room: { include: { hotel: true } }, guests: true },
        },
        payment: true,
      },
    });
  }

  // ─── Get single booking ──────────────────────────────────────────────────────
  async getBookingById(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightBooking: {
          include: {
            flight: { include: { airline: true, departureAirport: true, arrivalAirport: true } },
            passengers: true,
          },
        },
        hotelBooking: {
          include: { room: { include: { hotel: true } }, guests: true },
        },
        payment: true,
      },
    });

    if (!booking) throw ApiError.NotFound("Booking not found");
    if (booking.userId !== userId) throw ApiError.Forbidden();

    return booking;
  }

  // ─── Pay with saved payment method (server-side confirm) ────────────────────
  async paySavedMethod(bookingId, userId, paymentMethodId) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw ApiError.NotFound("Booking not found");
    if (booking.userId !== userId) throw ApiError.Forbidden();
    if (booking.status !== "PENDING") throw ApiError.BadRequest("Booking is not pending");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user?.stripeCustomerId) throw ApiError.BadRequest("No Stripe customer found for this user");

    try {
      await stripe.paymentIntents.update(booking.stripePaymentIntentId, {
        customer: user.stripeCustomerId,
      });

      const pi = await stripe.paymentIntents.confirm(booking.stripePaymentIntentId, {
        payment_method: paymentMethodId,
        return_url: process.env.CLIENT_URL + "/bookings",
      });

      if (pi.status !== "succeeded") {
        throw ApiError.BadRequest(`Payment not completed: ${pi.status}`);
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error("[booking] paySavedMethod stripe error", { message: err.message, code: err.code });
      throw ApiError.BadRequest(err.message ?? "Payment failed");
    }

    return { success: true };
  }

  // ─── Resume pending booking ──────────────────────────────────────────────────
  async resumeBooking(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flightBooking: { include: { flight: { include: { airline: true, departureAirport: true, arrivalAirport: true } }, passengers: true } },
        hotelBooking: { include: { room: { include: { hotel: true } } } },
      },
    });
    if (!booking) throw ApiError.NotFound("Booking not found");
    if (booking.userId !== userId) throw ApiError.Forbidden();
    if (booking.status !== "PENDING") throw ApiError.BadRequest("Booking is not pending");

    const pi = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
    return { clientSecret: pi.client_secret, booking };
  }

  // ─── Abandon (delete) a PENDING booking ─────────────────────────────────────
  async abandonBooking(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { flightBooking: true },
    });
    if (!booking || booking.userId !== userId) return;
    if (booking.status !== "PENDING") return;

    // Cancel PI in Stripe (best-effort, non-blocking)
    stripe.paymentIntents.cancel(booking.stripePaymentIntentId).catch(() => {});

    // Restore reserved seats
    const ops = [prisma.booking.delete({ where: { id: bookingId } })];
    if (booking.flightBooking) {
      ops.push(
        prisma.flight.update({
          where: { id: booking.flightBooking.flightId },
          data: { availableSeats: { increment: booking.flightBooking.seatCount } },
        }),
      );
    }
    await prisma.$transaction(ops);
    logger.info(`[booking] abandoned & deleted bookingId=${bookingId}, seats restored`);
  }

  // ─── Cancel booking ──────────────────────────────────────────────────────────
  async cancelBooking(bookingId, userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, flightBooking: true },
    });

    if (!booking) throw ApiError.NotFound("Booking not found");
    if (booking.userId !== userId) throw ApiError.Forbidden();
    if (booking.status === "CANCELLED") throw ApiError.BadRequest("Already cancelled");

    const ops = [
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      }),
    ];

    // Restore seats if was confirmed
    if (booking.status === "CONFIRMED" && booking.flightBooking) {
      ops.push(
        prisma.flight.update({
          where: { id: booking.flightBooking.flightId },
          data: { availableSeats: { increment: booking.flightBooking.seatCount } },
        }),
      );
    }

    // Refund via Stripe if paid
    if (booking.payment?.status === "PAID" && booking.payment.stripeChargeId) {
      await stripe.refunds.create({ charge: booking.payment.stripeChargeId });
      ops.push(
        prisma.payment.update({
          where: { id: booking.payment.id },
          data: { status: "REFUNDED", refundedAt: new Date() },
        }),
      );
    }

    await prisma.$transaction(ops);
    return { message: "Booking cancelled successfully" };
  }

  // ─── Admin: all bookings ─────────────────────────────────────────────────────
  async getAllBookingsAdmin({ page = 1, limit = 20, status }) {
    const where = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          flightBooking: { include: { flight: { include: { departureAirport: true, arrivalAirport: true } } } },
          hotelBooking: { include: { room: { include: { hotel: true } } } },
          payment: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }
}

export default new BookingService();
