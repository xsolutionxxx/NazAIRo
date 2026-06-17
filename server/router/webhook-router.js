import { Router } from "express";
import Stripe from "stripe";
import prisma from "../shared/lib/prisma-db.js";
import logger from "../shared/lib/logger.js";

const router = new Router();

// Raw body middleware — must run BEFORE express.json()
const rawBody = (req, res, next) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    req.rawBody = Buffer.concat(chunks);
    next();
  });
  req.on("error", next);
};

router.post("/stripe", rawBody, async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.warn(`[webhook] Invalid Stripe signature: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const booking = await prisma.booking.findFirst({
          where: { stripePaymentIntentId: pi.id },
        });

        if (booking && booking.status === "PENDING") {
          const ops = [
            prisma.booking.update({
              where: { id: booking.id },
              data: { status: "CONFIRMED" },
            }),
            prisma.payment.upsert({
              where: { bookingId: booking.id },
              update: { status: "PAID", paidAt: new Date() },
              create: {
                bookingId: booking.id,
                stripePaymentIntentId: pi.id,
                stripeChargeId: pi.latest_charge ?? null,
                amount: booking.totalPrice,
                currency: booking.currency,
                status: "PAID",
                paidAt: new Date(),
              },
            }),
          ];

          if (booking.type === "FLIGHT") {
            const fb = await prisma.flightBooking.findUnique({ where: { bookingId: booking.id } });
            if (fb) {
              ops.push(
                prisma.flight.update({
                  where: { id: fb.flightId },
                  data: { availableSeats: { decrement: fb.seatCount } },
                }),
              );
            }
          }

          await prisma.$transaction(ops);
          logger.info(`[webhook] Booking ${booking.id} confirmed via Stripe webhook`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        await prisma.payment.updateMany({
          where: { stripeChargeId: charge.id },
          data: { status: "REFUNDED", refundedAt: new Date() },
        });
        logger.info(`[webhook] Refund recorded for charge ${charge.id}`);
        break;
      }

      default:
        logger.debug(`[webhook] Unhandled event: ${event.type}`);
    }
  } catch (e) {
    logger.error("[webhook] Handler error", { stack: e.stack });
    return res.status(500).send("Internal error");
  }

  res.json({ received: true });
});

export default router;
