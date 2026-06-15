import prisma from "../shared/lib/prisma-db.js";

class StatsService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalFlights,
      totalHotels,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      revenueResult,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.flight.count(),
      prisma.hotel.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          flightBooking: { include: { flight: { include: { departureAirport: true, arrivalAirport: true } } } },
          hotelBooking:  { include: { room: { include: { hotel: true } } } },
          payment: true,
        },
      }),
    ]);

    return {
      users:     totalUsers,
      flights:   totalFlights,
      hotels:    totalHotels,
      bookings:  { total: totalBookings, confirmed: confirmedBookings, pending: pendingBookings, cancelled: cancelledBookings },
      revenue:   Number(revenueResult._sum.amount ?? 0),
      recentBookings,
    };
  }
}

export default new StatsService();
