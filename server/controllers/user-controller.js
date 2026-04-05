import prisma from "../shared/lib/prisma-db.js";
import userService from "../service/user-service.js";
import UserDto from "../dtos/user-dto.js";
class UserController {
  async registration(req, res, next) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      const userData = await userService.registration(
        email,
        password,
        firstName,
        lastName,
        phone,
      );
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const userData = await userService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const token = await userService.logout(refreshToken);

      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await userService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async requestEmailChange(req, res, next) {
    try {
      const { id } = req.user;
      const { newEmail, password } = req.body;

      await userService.requestEmailChange(id, newEmail, password);

      return res.json({ message: "Confirmation link sent to your new email" });
    } catch (e) {
      next(e);
    }
  }

  async confirmEmailChange(req, res, next) {
    try {
      const { link } = req.params;

      const userData = await userService.confirmEmailChange(link);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.redirect(
        `${process.env.CLIENT_URL}/account?emailUpdated=true`,
      );
    } catch (e) {
      return res.redirect(
        `${process.env.CLIENT_URL}/account?error=invalid-link`,
      );
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { id } = req.user;
      const { firstName, lastName, phone } = req.body;

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;

      const userData = await userService.updateProfile(id, updateData);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { id } = req.user;
      const { currentPassword, newPassword } = req.body;

      const userData = await userService.changePassword(
        id,
        currentPassword,
        newPassword,
      );
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
