import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import prisma from "../shared/lib/prisma-db.js";
import mailService from "./mail-service.js";
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";
import ApiError from "../exceptions/api-error.js";

class UserService {
  async registration(email, password, firstName, lastName, phone) {
    const candidate = await prisma.user.findUnique({ where: { email } });

    if (candidate) {
      throw ApiError.BadRequest(
        `A user with the email address ${email} already exists`,
      );
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        firstName,
        lastName,
        phone,
        activationLink,
      },
    });

    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`,
    );

    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async activate(activationLink) {
    const user = await prisma.user.findUnique({ where: { activationLink } });

    if (!user) {
      throw ApiError.BadRequest("The activation link is invalid");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isActivated: true },
    });
  }
}

export default new UserService();
