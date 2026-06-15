import statsService from "../service/stats-service.js";

class StatsController {
  async getDashboard(req, res, next) {
    try {
      const stats = await statsService.getDashboardStats();
      return res.json(stats);
    } catch (e) { next(e); }
  }
}

export default new StatsController();
