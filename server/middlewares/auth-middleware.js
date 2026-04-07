import ApiError from "../exceptions/api-error.js";
import tokenService from "../service/token-service.js";

export default function (req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) return next(ApiError.UnauthorizedError());

    const userData = tokenService.validateAccessToken(accessToken);

    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}
