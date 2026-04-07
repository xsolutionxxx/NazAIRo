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
