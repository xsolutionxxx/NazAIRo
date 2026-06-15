import pdfService from "../service/pdf-service.js";
import prisma from "../shared/lib/prisma-db.js";
import ApiError from "../exceptions/api-error.js";

class PdfController {
  async downloadTicket(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          flightBooking: {
            include: {
              flight: {
                include: { airline: true, departureAirport: true, arrivalAirport: true },
              },
              passengers: true,
            },
          },
          hotelBooking: {
            include: {
              room: { include: { hotel: true } },
              guests: true,
            },
          },
          payment: true,
        },
      });

      if (!booking)                  throw ApiError.NotFound("Booking not found");
      if (booking.userId !== userId) throw ApiError.Forbidden();
      if (booking.status !== "CONFIRMED") throw ApiError.BadRequest("Ticket available only for confirmed bookings");

      const isFlight = booking.type === "FLIGHT";
      const filename = isFlight
        ? `ticket-${booking.flightBooking.flight.flightNumber}-${id.slice(0, 8)}.pdf`
        : `voucher-${booking.hotelBooking.room.hotel.city}-${id.slice(0, 8)}.pdf`;

      res.setHeader("Content-Type",        "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      const doc = isFlight
        ? pdfService.generateFlightTicket(booking)
        : pdfService.generateHotelVoucher(booking);

      doc.pipe(res);
    } catch (e) {
      next(e);
    }
  }
}

export default new PdfController();
