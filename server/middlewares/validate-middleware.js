import { ZodError } from "zod";
import ApiError from "../exceptions/api-error.js";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedErrors = (err.issues || []).map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));

      return next(ApiError.BadRequest("Validation error", formattedErrors));
    }

    next(err);
  }
};
