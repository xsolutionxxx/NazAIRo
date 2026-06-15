import { z } from "zod";

const passengerSchema = z.object({
  firstName:      z.string().min(1),
  lastName:       z.string().min(1),
  dateOfBirth:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passportNumber: z.string().min(5),
  nationality:    z.string().min(2),
});

export const initiateFlightBookingSchema = z.object({
  flightId:    z.string().uuid(),
  cabinClass:  z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).optional(),
  passengers:  z.array(passengerSchema).min(1).max(9),
});
