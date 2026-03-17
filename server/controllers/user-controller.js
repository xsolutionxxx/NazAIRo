import prisma from "../shared/lib/prisma-db.js";

class UserController {
  async registration(req, res, next) {
    try {
    } catch (e) {}
  }

  async login(req, res, next) {
    try {
    } catch (e) {}
  }

  async logout(req, res, next) {
    try {
    } catch (e) {}
  }

  async activate(req, res, next) {
    try {
    } catch (e) {}
  }

  async refresh(req, res, next) {
    try {
    } catch (e) {}
  }

  async getUser(req, res, next) {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (e) {}
  }
}

export default new UserController();
