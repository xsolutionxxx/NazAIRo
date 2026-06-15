import Stripe from "stripe";
import prisma from "../shared/lib/prisma-db.js";
import ApiError from "../exceptions/api-error.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // cents
      currency: "usd",
      metadata: {
        userId,
        flightId,
        passengerCount: String(passengers.length),
      },
    });

    // Create pending booking atomically
    const booking = await prisma.booking.create({
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
                firstName: p.firstName,
                lastName: p.lastName,
                dateOfBirth: new Date(p.dateOfBirth),
                passportNumber: p.passportNumber,
                nationality: p.nationality,
              })),
            },
          },
        },
      },
      include: {
        flightBooking: { include: { flight: { include: { airline: true, departureAirport: true, arrivalAirport: true } }, passengers: true } },
      },
    });

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

    // Decrement seats only for flight bookings
    if (booking.type === "FLIGHT" && booking.flightBooking) {
      ops.push(
        prisma.flight.update({
          where: { id: booking.flightBooking.flightId },
          data: { availableSeats: { decrement: booking.flightBooking.seatCount } },
        }),
      );
    }

    const [confirmed] = await prisma.$transaction(ops);
    return confirmed;
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

    const totalPrice = Number(room.pricePerNight) * nights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: "usd",
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
                dateOfBirth:    new Date(g.dateOfBirth),
                passportNumber: g.passportNumber,
                nationality:    g.nationality,
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
      where: { userId },
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
