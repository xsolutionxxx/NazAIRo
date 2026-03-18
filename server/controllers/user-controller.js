import prisma from "../shared/lib/prisma-db.js";
import userService from "../service/user-service.js";
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
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
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
    } catch (e) {
      next(e);
    }
  }

  async getUser(req, res, next) {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
