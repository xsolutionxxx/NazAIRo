import Stripe from "stripe";
import prisma from "../shared/lib/prisma-db.js";
import ApiError from "../exceptions/api-error.js";

let _stripe = null;
const stripe = new Proxy({}, {
  get(_, prop) {
    if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    return _stripe[prop];
  },
});

class PaymentMethodService {
  // Get all saved cards for a user
  async getPaymentMethods(userId) {
    return prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
  }

  // Create a Stripe SetupIntent so client can securely save a card
  async createSetupIntent(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.NotFound("User not found");

    // Get or create a Stripe customer for this user
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name:  `${user.firstName} ${user.lastName}`,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data:  { stripeCustomerId: customerId },
      });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return { clientSecret: setupIntent.client_secret };
  }

  // Save card after successful SetupIntent
  async savePaymentMethod(userId, { setupIntentId }) {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);

    if (setupIntent.status !== "succeeded")
      throw ApiError.BadRequest("Card setup not completed");

    const pmId = typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id;

    if (!pmId) throw ApiError.BadRequest("No payment method found");

    const stripeCard = await stripe.paymentMethods.retrieve(pmId);
    const card = stripeCard.card;

    // Check if already saved
    const existing = await prisma.paymentMethod.findFirst({
      where: { userId, providerId: pmId },
    });
    if (existing) return existing;

    const isFirstCard = (await prisma.paymentMethod.count({ where: { userId } })) === 0;

    return prisma.paymentMethod.create({
      data: {
        userId,
        type:       card.brand.toUpperCase(),
        lastFour:   card.last4,
        providerId: pmId,
        isDefault:  isFirstCard,
      },
    });
  }

  // Set a card as default
  async setDefault(userId, methodId) {
    const method = await prisma.paymentMethod.findUnique({ where: { id: methodId } });
    if (!method || method.userId !== userId) throw ApiError.NotFound("Payment method not found");

    await prisma.$transaction([
      prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.paymentMethod.update({ where: { id: methodId }, data: { isDefault: true } }),
    ]);

    return prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
  }

  // Delete a card
  async deletePaymentMethod(userId, methodId) {
    const method = await prisma.paymentMethod.findUnique({ where: { id: methodId } });
    if (!method || method.userId !== userId) throw ApiError.NotFound("Payment method not found");

    // Detach from Stripe
    await stripe.paymentMethods.detach(method.providerId).catch(() => {});

    await prisma.paymentMethod.delete({ where: { id: methodId } });

    // If only one card remains or deleted card was default — make first remaining the default
    const remaining = await prisma.paymentMethod.findMany({ where: { userId } });
    if (remaining.length === 1 || (method.isDefault && remaining.length > 0)) {
      if (!remaining[0].isDefault) {
        await prisma.paymentMethod.update({ where: { id: remaining[0].id }, data: { isDefault: true } });
      }
    }

    return prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    });
  }
}

export default new PaymentMethodService();
