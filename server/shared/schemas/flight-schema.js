import { z } from "zod";

export const flightSearchSchema = z.object({
  from:               z.string().length(3, "IATA code must be 3 characters"),
  to:                 z.string().length(3, "IATA code must be 3 characters"),
  date:               z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  returnDate:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  passengers:         z.coerce.number().int().min(1).max(9).optional(),
  cabinClass:         z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).optional(),
  minPrice:           z.coerce.number().min(0).optional(),
  maxPrice:           z.coerce.number().min(0).optional(),
  airlines:           z.string().optional(),
  departureTimeFrom:  z.coerce.number().min(0).max(23).optional(),
  departureTimeTo:    z.coerce.number().min(0).max(23).optional(),
  sortBy:             z.enum(["price", "duration", "departure", "arrival"]).optional(),
  sortOrder:          z.enum(["asc", "desc"]).optional(),
  page:               z.coerce.number().int().min(1).optional(),
  limit:              z.coerce.number().int().min(1).max(50).optional(),
});

export const flightCreateSchema = z.object({
  flightNumber:     z.string().min(2),
  airlineIata:      z.string().length(2),
  departureIata:    z.string().length(3),
  arrivalIata:      z.string().length(3),
  departureTime:    z.string().datetime(),
  arrivalTime:      z.string().datetime(),
  price:            z.number().positive(),
  cabinClass:       z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]),
  availableSeats:   z.number().int().positive(),
  totalSeats:       z.number().int().positive(),
  amenities:        z.array(z.string()).optional().default([]),
});
