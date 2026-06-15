import $api from "@shared/api";

export const adminApi = {
  // Stats
  getStats: () => $api.get("/admin/stats"),

  // Flights
  getFlights: (params?: { page?: number; limit?: number; search?: string }) =>
    $api.get("/admin/flights", { params }),
  createFlight: (data: any) => $api.post("/admin/flights", data),
  updateFlight: (id: string, data: any) => $api.patch(`/admin/flights/${id}`, data),
  deleteFlight: (id: string) => $api.delete(`/admin/flights/${id}`),

  // Hotels
  getHotels: (params?: { page?: number; limit?: number; search?: string }) =>
    $api.get("/admin/hotels", { params }),
  createHotel: (data: any) => $api.post("/admin/hotels", data),
  updateHotel: (id: string, data: any) => $api.patch(`/admin/hotels/${id}`, data),
  deleteHotel: (id: string) => $api.delete(`/admin/hotels/${id}`),

  // Bookings
  getBookings: (params?: { page?: number; limit?: number; status?: string }) =>
    $api.get("/admin/bookings", { params }),

  // Users
  getUsers: () => $api.get("/users"),
};
