import paymentMethodService from "../service/payment-method-service.js";

class PaymentMethodController {
  async getAll(req, res, next) {
    try {
      const methods = await paymentMethodService.getPaymentMethods(req.user.id);
      return res.json(methods);
    } catch (e) { next(e); }
  }

  async createSetupIntent(req, res, next) {
    try {
      const result = await paymentMethodService.createSetupIntent(req.user.id);
      return res.json(result);
    } catch (e) { next(e); }
  }

  async save(req, res, next) {
    try {
      const method = await paymentMethodService.savePaymentMethod(req.user.id, req.body);
      return res.status(201).json(method);
    } catch (e) { next(e); }
  }

  async setDefault(req, res, next) {
    try {
      const methods = await paymentMethodService.setDefault(req.user.id, req.params.id);
      return res.json(methods);
    } catch (e) { next(e); }
  }

  async remove(req, res, next) {
    try {
      const result = await paymentMethodService.deletePaymentMethod(req.user.id, req.params.id);
      return res.json(result);
    } catch (e) { next(e); }
  }
}

export default new PaymentMethodController();
