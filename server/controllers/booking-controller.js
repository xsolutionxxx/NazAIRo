import bookingService from "../service/booking-service.js";

class BookingController {
  async initiateFlightBooking(req, res, next) {
    try {
      const { id: userId } = req.user;
      const result = await bookingService.initiateFlightBooking(userId, req.body);
      return res.status(201).json(result);
    } catch (e) { next(e); }
  }

  async initiateHotelBooking(req, res, next) {
    try {
      const { id: userId } = req.user;
      const result = await bookingService.initiateHotelBooking(userId, req.body);
      return res.status(201).json(result);
    } catch (e) { next(e); }
  }

  async confirmBooking(req, res, next) {
    try {
      const { id: userId } = req.user;
      const result = await bookingService.confirmBooking(req.params.id, userId);
      return res.json(result);
    } catch (e) { next(e); }
  }

  async getUserBookings(req, res, next) {
    try {
      const { id: userId } = req.user;
      const bookings = await bookingService.getUserBookings(userId);
      return res.json(bookings);
    } catch (e) { next(e); }
  }

  async getBookingById(req, res, next) {
    try {
      const { id: userId } = req.user;
      const booking = await bookingService.getBookingById(req.params.id, userId);
      return res.json(booking);
    } catch (e) { next(e); }
  }

  async cancelBooking(req, res, next) {
    try {
      const { id: userId } = req.user;
      const result = await bookingService.cancelBooking(req.params.id, userId);
      return res.json(result);
    } catch (e) { next(e); }
  }

  async adminGetAll(req, res, next) {
    try {
      const result = await bookingService.getAllBookingsAdmin(req.query);
      return res.json(result);
    } catch (e) { next(e); }
  }
}

export default new BookingController();
