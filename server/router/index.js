import { Router } from "express";
import userController from "../controllers/user-controller.js";
import { validate } from "../middlewares/validate-middleware.js";
import { registrationSchema } from "../shared/schemas/auth-schema.js";
import { loginSchema } from "../shared/schemas/auth-schema.js";

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
router.get("/users", userController.getUsers);

export default router;
