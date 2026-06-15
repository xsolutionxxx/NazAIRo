import ApiError from "../exceptions/api-error.js";

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    return next(ApiError.BadRequest("Validation error", formattedErrors));
  }

  req.body = result.data;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    return next(ApiError.BadRequest("Validation error", formattedErrors));
  }

  // Express 5 makes req.query read-only — attach parsed data separately
  req.validatedQuery = result.data;
  next();
};
