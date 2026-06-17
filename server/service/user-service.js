import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { BCRYPT_ROUNDS } from "../shared/lib/constants.js";

import prisma from "../shared/lib/prisma-db.js";
import mailService from "./mail-service.js";
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";
import ApiError from "../exceptions/api-error.js";

class UserService {
  async registration(email, password, firstName, lastName, phone) {
    const [candidate, preCandidate] = await Promise.all([
      prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } }),
      prisma.preUser.findFirst({ where: { OR: [{ email }, { phone }] } }),
    ]);

    if (candidate || preCandidate) {
      const existingUser = candidate || preCandidate;

      const field = existingUser.email === email ? "email" : "phone";
      throw ApiError.BadRequest(
        `User with this ${field} already exists or waiting for activation`,
      );
    }

    const hashPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const activationLink = uuidv4();

    await prisma.preUser.create({
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

    return {
      message:
        "An activation letter has been sent to your email address. Please follow the instructions to activate your account.",
    };
  }

  async activate(activationLink) {
    const preUser = await prisma.preUser.findUnique({
      where: { activationLink },
    });

    if (!preUser) {
      throw ApiError.BadRequest("The activation link is invalid");
    }

    const user = await prisma.user.create({
      data: {
        email: preUser.email,
        password: preUser.password,
        firstName: preUser.firstName,
        lastName: preUser.lastName,
        phone: preUser.phone,
        isActivated: true,
      },
    });

    await prisma.preUser.delete({
      where: { id: preUser.id },
    });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const preUser = await prisma.preUser.findFirst({ where: { email } });
      if (preUser) {
        throw ApiError.BadRequest(
          "Please verify your email address first. Check your inbox for the activation link.",
        );
      }
      throw ApiError.BadRequest("User not found");
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest("Invalid email or password");
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);

    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await prisma.user.findUnique({ where: { id: userData.id } });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async requestEmailChange(userId, newEmail, password) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const [emailInUse, emailInPre] = await Promise.all([
      prisma.user.findUnique({ where: { email: newEmail } }),
      prisma.preUser.findUnique({ where: { email: newEmail } }),
    ]);

    if (emailInUse || emailInPre || user.email === newEmail) {
      throw ApiError.BadRequest(
        "User with this email already exists or waiting for activation",
      );
    }

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) throw ApiError.BadRequest("Incorrect password");

    const activationLink = uuidv4();
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        activationLink: activationLink,
      },
    });

    await mailService.sendEmailChangeMail(
      newEmail,
      `${process.env.API_URL}/api/confirm-email-change/${activationLink}`,
    );

    return {
      message: "A confirmation email has been sent to your new email address.",
    };
  }

  async confirmEmailChange(activationLink) {
    if (!activationLink) {
      throw ApiError.BadRequest("Confirmation link is missing");
    }

    const user = await prisma.user.findUnique({
      where: { activationLink: activationLink },
    });

    if (!user || !user.pendingEmail) {
      throw ApiError.BadRequest("Invalid or expired confirmation link");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        activationLink: null,
      },
    });

    const userDto = new UserDto(updatedUser);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async checkEmailChangeStatus(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return { isPending: !!user.pendingEmail };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isPassEquals = await bcrypt.compare(currentPassword, user.password);

    if (!isPassEquals)
      throw ApiError.BadRequest("The exact password is incorrect");

    const hashPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword },
    });

    return new UserDto(updatedUser);
  }

  async updateProfile(userId, updateData) {
    if (updateData.phone) {
      const candidate = await prisma.user.findFirst({
        where: {
          phone: updateData.phone,
          NOT: { id: userId },
        },
      });

      if (candidate) {
        throw ApiError.BadRequest("User with this phone number already exists");
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return new UserDto(updatedUser);
  }

  async getUsers({ search, role, page = 1, limit = 20 } = {}) {
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, role: true, isActivated: true, isBlocked: true,
          avatarUrl: true, createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
  }

  async blockUser(targetId, block) {
    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw ApiError.NotFound("User not found");

    await prisma.$transaction([
      prisma.user.update({ where: { id: targetId }, data: { isBlocked: block } }),
      // Invalidate all refresh tokens so the blocked user can't renew session
      ...(block ? [prisma.refreshToken.deleteMany({ where: { userId: targetId } })] : []),
    ]);

    return { id: targetId, isBlocked: block };
  }

  async setRole(targetId, role) {
    const allowed = ["CLIENT", "ADMIN"];
    if (!allowed.includes(role)) throw ApiError.BadRequest("Invalid role");

    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw ApiError.NotFound("User not found");

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: { role },
      select: { id: true, email: true, role: true },
    });
    return updated;
  }
}

export default new UserService();
