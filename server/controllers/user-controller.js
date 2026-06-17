import userService from "../service/user-service.js";
import {
  REFRESH_TOKEN_MAX_AGE,
  ACCESS_TOKEN_MAX_AGE,
} from "../shared/lib/constants.js";

const setAuthCookies = (res, userData) => {
  const commonOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  };

  res.cookie("refreshToken", userData.refreshToken, {
    ...commonOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
  res.cookie("accessToken", userData.accessToken, {
    ...commonOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
};

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

      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const userData = await userService.login(email, password);

      setAuthCookies(res, userData);

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
      res.clearCookie("accessToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const userData = await userService.refresh(refreshToken);

      setAuthCookies(res, userData);

      return res.json(userData);
    } catch (e) {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
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

      setAuthCookies(res, userData);

      return res.redirect(
        `${process.env.CLIENT_URL}/account?emailUpdated=true`,
      );
    } catch (e) {
      return res.redirect(
        `${process.env.CLIENT_URL}/account?error=invalid-link`,
      );
    }
  }

  async checkEmailChangeStatus(req, res, next) {
    try {
      const { id } = req.user;
      const status = await userService.checkEmailChangeStatus(id);
      return res.json(status);
    } catch (e) {
      next(e);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { id } = req.user;

      const userData = await userService.updateProfile(id, req.body);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const avatarUrl = req.file.path;
      const userData = await userService.updateProfile(req.user.id, { avatarUrl });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async uploadCover(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const backgroundUrl = req.file.path;
      const userData = await userService.updateProfile(req.user.id, { backgroundUrl });
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
      const { search, role, page, limit } = req.query;
      const usersData = await userService.getUsers({ search, role, page, limit });
      res.json(usersData);
    } catch (e) {
      next(e);
    }
  }

  async blockUser(req, res, next) {
    try {
      const { id } = req.params;
      const { block } = req.body; // true = block, false = unblock
      const result = await userService.blockUser(id, Boolean(block));
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  async setRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const result = await userService.setRole(id, role);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
