import ApiError from "../exceptions/api-error.js";
import logger from "../shared/lib/logger.js";

export default function (err, req, res, next) {
  if (err instanceof ApiError) {
    logger.warn(`[${req.method}] ${req.path} → ${err.status} ${err.message}`);
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  logger.error(`[${req.method}] ${req.path} → 500`, { stack: err.stack });
  return res.status(500).json({ message: "Internal server error" });
}
