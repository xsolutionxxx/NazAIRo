import { z } from "zod";

export const hotelSearchSchema = z.object({
  city:      z.string().min(1),
  checkIn:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests:    z.coerce.number().min(1).max(20).optional(),
  stars:     z.coerce.number().min(1).max(5).optional(),
  minPrice:  z.coerce.number().min(0).optional(),
  maxPrice:  z.coerce.number().min(0).optional(),
  sortBy:    z.enum(["price", "stars", "rating", "name"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page:      z.coerce.number().min(1).optional(),
  limit:     z.coerce.number().min(1).max(50).optional(),
});

export const initiateHotelBookingSchema = z.object({
  roomId:    z.string().uuid(),
  checkIn:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestCount: z.number().min(1).max(20),
  guests: z.array(z.object({
    firstName:      z.string().min(1),
    lastName:       z.string().min(1),
    dateOfBirth:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    passportNumber: z.string().min(5),
    nationality:    z.string().min(2),
  })).min(1),
});
