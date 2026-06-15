import ApiError from "../exceptions/api-error.js";

export default function (req, res, next) {
  if (!req.user) return next(ApiError.UnauthorizedError());
  if (req.user.role !== "ADMIN") return next(ApiError.Forbidden("Admin access required"));
  next();
}
