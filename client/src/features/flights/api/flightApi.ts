import $api from "@shared/api";
import type { IAirline, IAirport, IFlightSearchParams, IFlightSearchResult } from "@entities/flight/types/IFlight";

export const flightApi = {
  search: (params: IFlightSearchParams) =>
    $api.get<IFlightSearchResult>("/flights/search", { params }),

  getById: (id: string) =>
    $api.get(`/flights/${id}`),

  getAirports: (search?: string) =>
    $api.get<IAirport[]>("/flights/airports", { params: { search } }),

  getAirlines: () =>
    $api.get<IAirline[]>("/flights/airlines"),
};
