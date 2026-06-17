import ApiError from "../exceptions/api-error.js";
import tokenService from "../service/token-service.js";
import prisma from "../shared/lib/prisma-db.js";

export default async function (req, res, next) {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return next(ApiError.UnauthorizedError());

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) return next(ApiError.UnauthorizedError());

    // Check if user is blocked (verify against DB on each request)
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: { isBlocked: true },
    });
    if (!user || user.isBlocked) return next(ApiError.UnauthorizedError());

    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}
