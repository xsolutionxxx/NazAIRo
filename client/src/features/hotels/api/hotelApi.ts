import $api from "@shared/api";
import type { IHotelDetail, IHotelSearchParams, IHotelSearchResult } from "@entities/hotel/types/IHotel";

export const hotelApi = {
  search: (params: IHotelSearchParams) =>
    $api.get<IHotelSearchResult>("/hotels/search", { params }),

  getById: (id: string, params?: { checkIn?: string; checkOut?: string; guests?: number }) =>
    $api.get<IHotelDetail>(`/hotels/${id}`, { params }),

  getCities: (search?: string) =>
    $api.get<{ city: string; country: string }[]>("/hotels/cities", { params: { search } }),
};

export const hotelBookingApi = {
  initiateHotelBooking: (data: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    guests: { firstName: string; lastName: string }[];
  }) => $api.post<{ bookingId: string; clientSecret: string; totalPrice: number }>("/bookings/hotel", data),
};
