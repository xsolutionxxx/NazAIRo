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
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    $api.get("/users", { params }),
  blockUser: (id: string, block: boolean) =>
    $api.patch(`/admin/users/${id}/block`, { block }),
  setUserRole: (id: string, role: string) =>
    $api.patch(`/admin/users/${id}/role`, { role }),
};
