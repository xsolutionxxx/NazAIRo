import cron from "node-cron";
import Stripe from "stripe";
import prisma from "./prisma-db.js";
import logger from "./logger.js";

let _stripe = null;
const stripe = new Proxy({}, { get(_, p) { if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY); return _stripe[p]; } });

// Runs every hour: marks past CONFIRMED bookings as COMPLETED
async function markCompletedBookings() {
  const now = new Date();
  try {
    const [flights, hotels] = await Promise.all([
      // Flight bookings where departure time has passed
      prisma.booking.updateMany({
        where: {
          status: "CONFIRMED",
          type: "FLIGHT",
          flightBooking: { flight: { departureTime: { lt: now } } },
        },
        data: { status: "COMPLETED" },
      }),
      // Hotel bookings where check-out date has passed
      prisma.booking.updateMany({
        where: {
          status: "CONFIRMED",
          type: "HOTEL",
          hotelBooking: { checkOut: { lt: now } },
        },
        data: { status: "COMPLETED" },
      }),
    ]);

    const total = flights.count + hotels.count;
    if (total > 0) {
      logger.info(`[cron] Marked ${total} bookings as COMPLETED (flights: ${flights.count}, hotels: ${hotels.count})`);
    }
  } catch (e) {
    logger.error("[cron] Failed to mark completed bookings", { stack: e.stack });
  }
}

async function cleanAbandonedBookings() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
  try {
    const stale = await prisma.booking.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      select: { id: true, stripePaymentIntentId: true },
    });
    if (!stale.length) return;
    for (const b of stale) {
      try { await stripe.paymentIntents.cancel(b.stripePaymentIntentId); } catch {}
    }
    const { count } = await prisma.booking.deleteMany({
      where: { id: { in: stale.map(b => b.id) } },
    });
    logger.info(`[cron] Deleted ${count} abandoned PENDING bookings`);
  } catch (e) {
    logger.error("[cron] cleanAbandonedBookings failed", { stack: e.stack });
  }
}

export function startCronJobs() {
  cron.schedule("0 * * * *", markCompletedBookings);
  cron.schedule("30 * * * *", cleanAbandonedBookings); // every hour at :30
  logger.info("[cron] Scheduled: markCompletedBookings + cleanAbandonedBookings");
}
