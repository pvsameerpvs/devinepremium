import Stripe = require("stripe");
import { env } from "../config/env";
import { HttpError } from "../utils/http";

let stripeClient: Stripe.Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError(
      503,
      "Stripe is not configured. Add STRIPE_SECRET_KEY to the backend environment.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      maxNetworkRetries: 2,
      typescript: true,
    });
  }

  return stripeClient;
}
