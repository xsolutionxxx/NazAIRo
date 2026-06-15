export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export interface IAirport {
  id: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
}

export interface IAirline {
  id: string;
  iata: string;
  name: string;
  logoUrl?: string;
}

export interface IFlight {
  id: string;
  flightNumber: string;
  airline: IAirline;
  departure: { airport: IAirport; time: string };
  arrival: { airport: IAirport; time: string };
  duration: { minutes: number; formatted: string };
  price: number;
  cabinClass: CabinClass;
  availableSeats: number;
  totalSeats: number;
  amenities: string[];
}

export interface IFlightSearchParams {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: CabinClass;
  minPrice?: number;
  maxPrice?: number;
  airlines?: string;
  departureTimeFrom?: number;
  departureTimeTo?: number;
  sortBy?: "price" | "duration" | "departure" | "arrival";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface IFlightSearchResult {
  flights: IFlight[];
  returnFlights: IFlight[] | null;
  total: number;
  page: number;
  totalPages: number;
}
