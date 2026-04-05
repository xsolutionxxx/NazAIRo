import { Router } from "express";
import userController from "../controllers/user-controller.js";
import { validate } from "../middlewares/validate-middleware.js";
import {
  registrationSchema,
  loginSchema,
} from "../shared/schemas/auth-schema.js";
import {
  emailChangeSchema,
  passwordChangeSchema,
  profileSchema,
} from "../shared/schemas/user-schema.js";
import authMiddleware from "../middlewares/auth-middleware.js";

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

router.get("/confirm-email-change/:link", userController.confirmEmailChange);

router.get("/users", authMiddleware, userController.getUsers);

export default router;
