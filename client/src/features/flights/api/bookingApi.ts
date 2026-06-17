import $api from "@shared/api";

export interface IPassengerForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  nationality: string;
}

export interface IInitiateBookingPayload {
  flightId: string;
  cabinClass?: string;
  passengers: IPassengerForm[];
}

export const bookingApi = {
  initiateFlightBooking: (data: IInitiateBookingPayload) =>
    $api.post<{ bookingId: string; clientSecret: string; totalPrice: number }>(
      "/bookings/flight",
      data,
    ),

  confirmBooking: (bookingId: string) =>
    $api.post(`/bookings/${bookingId}/confirm`),

  getUserBookings: () =>
    $api.get("/bookings"),

  getBookingById: (id: string) =>
    $api.get(`/bookings/${id}`),

  cancelBooking: (id: string) =>
    $api.patch(`/bookings/${id}/cancel`),

  resumeBooking: (id: string) =>
    $api.get<{ clientSecret: string; booking: any }>(`/bookings/${id}/resume`),

  abandonBooking: (id: string) =>
    $api.delete(`/bookings/${id}/abandon`),
};
