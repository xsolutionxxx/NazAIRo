import jwt from "jsonwebtoken";
import prisma from "../shared/lib/prisma-db.js";

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "15d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await prisma.refreshToken.findFirst({
      where: { userId },
    });

    if (tokenData) {
      return await prisma.refreshToken.update({
        where: { id: tokenData.id },
        data: { token: refreshToken },
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 15);

    const token = await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return token;
  }
}

export default new TokenService();
