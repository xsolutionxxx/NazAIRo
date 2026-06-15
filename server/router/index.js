import { Router } from "express";
import userController from "../controllers/user-controller.js";
import flightController from "../controllers/flight-controller.js";
import hotelController from "../controllers/hotel-controller.js";
import statsController from "../controllers/stats-controller.js";
import pdfController from "../controllers/pdf-controller.js";
import paymentMethodController from "../controllers/payment-method-controller.js";
import bookingController from "../controllers/booking-controller.js";
import { validate, validateQuery } from "../middlewares/validate-middleware.js";
import {
  registrationSchema,
  loginSchema,
} from "../shared/schemas/auth-schema.js";
import {
  emailChangeSchema,
  passwordChangeSchema,
  profileSchema,
} from "../shared/schemas/user-schema.js";
import { flightSearchSchema, flightCreateSchema } from "../shared/schemas/flight-schema.js";
import { hotelSearchSchema, initiateHotelBookingSchema } from "../shared/schemas/hotel-schema.js";
import { initiateFlightBookingSchema } from "../shared/schemas/booking-schema.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import adminMiddleware from "../middlewares/admin-middleware.js";

const router = new Router();

router.post(
  "/registration",
  validate(registrationSchema),
  userController.registration,
);
router.post("/login", validate(loginSchema), userController.login);
router.post("/logout", userController.logout);
router.get("/activate/:link", userController.activate);
router.get("/refresh", userController.refresh);
router.get("/confirm-email-change/:link", userController.confirmEmailChange);
router.get(
  "/email-change-status",
  authMiddleware,
  userController.checkEmailChangeStatus,
);

router.post(
  "/request-email-change",
  authMiddleware,
  validate(emailChangeSchema),
  userController.requestEmailChange,
);

router.post(
  "/change-password",
  authMiddleware,
  validate(passwordChangeSchema),
  userController.changePassword,
);

router.patch(
  "/update-profile",
  authMiddleware,
  validate(profileSchema.partial()),
  userController.updateProfile,
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  userController.getUsers,
);

// ─── Flights (public) ────────────────────────────────────────────────────────
router.get("/flights/search",   validateQuery(flightSearchSchema), flightController.search);
router.get("/flights/airports", flightController.getAirports);
router.get("/flights/airlines", flightController.getAirlines);
router.get("/flights/:id",      flightController.getById);

// ─── Hotels (public) ──────────────────────────────────────────────────────────
router.get("/hotels/search", validateQuery(hotelSearchSchema), hotelController.search);
router.get("/hotels/cities", hotelController.getCities);
router.get("/hotels/:id",    hotelController.getById);

// ─── Admin stats ──────────────────────────────────────────────────────────────
router.get("/admin/stats", authMiddleware, adminMiddleware, statsController.getDashboard);

// ─── Hotels (admin) ───────────────────────────────────────────────────────────
router.get(    "/admin/bookings",   authMiddleware, adminMiddleware, bookingController.adminGetAll);
router.get(    "/admin/hotels",     authMiddleware, adminMiddleware, hotelController.adminGetAll);
router.post(   "/admin/hotels",     authMiddleware, adminMiddleware, hotelController.adminCreate);
router.patch(  "/admin/hotels/:id", authMiddleware, adminMiddleware, hotelController.adminUpdate);
router.delete( "/admin/hotels/:id", authMiddleware, adminMiddleware, hotelController.adminDelete);

// ─── Bookings ─────────────────────────────────────────────────────────────────
router.post(   "/bookings/flight",  authMiddleware, validate(initiateFlightBookingSchema), bookingController.initiateFlightBooking);
router.post(   "/bookings/hotel",   authMiddleware, validate(initiateHotelBookingSchema),  bookingController.initiateHotelBooking);
router.post(   "/bookings/:id/confirm", authMiddleware, bookingController.confirmBooking);
router.get(    "/bookings",           authMiddleware, bookingController.getUserBookings);
router.get(    "/bookings/:id",       authMiddleware, bookingController.getBookingById);
router.patch(  "/bookings/:id/cancel", authMiddleware, bookingController.cancelBooking);
router.get(    "/bookings/:id/ticket", authMiddleware, pdfController.downloadTicket);

// ─── Payment methods ──────────────────────────────────────────────────────────
router.get(    "/payment-methods",              authMiddleware, paymentMethodController.getAll);
router.post(   "/payment-methods/setup-intent", authMiddleware, paymentMethodController.createSetupIntent);
router.post(   "/payment-methods",              authMiddleware, paymentMethodController.save);
router.patch(  "/payment-methods/:id/default",  authMiddleware, paymentMethodController.setDefault);
router.delete( "/payment-methods/:id",          authMiddleware, paymentMethodController.remove);

// ─── Flights (admin) ─────────────────────────────────────────────────────────
router.get(    "/admin/flights",     authMiddleware, adminMiddleware, flightController.adminGetAll);
router.post(   "/admin/flights",     authMiddleware, adminMiddleware, validate(flightCreateSchema), flightController.adminCreate);
router.patch(  "/admin/flights/:id", authMiddleware, adminMiddleware, flightController.adminUpdate);
router.delete( "/admin/flights/:id", authMiddleware, adminMiddleware, flightController.adminDelete);

export default router;
