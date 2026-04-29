import Stripe = require("stripe");
import { AppDataSource } from "../config/data-source";
import { env } from "../config/env";
import { Booking } from "../entities/Booking";
import { Payment } from "../entities/Payment";
import { getStripeClient } from "../lib/stripe";
import { PaymentStatus } from "../types/domain";
import { HttpError } from "../utils/http";

const paymentRepository = () => AppDataSource.getRepository(Payment);
const bookingRepository = () => AppDataSource.getRepository(Booking);

type StripeCheckoutSession = Awaited<
  ReturnType<Stripe.Stripe["checkout"]["sessions"]["retrieve"]>
>;
type StripePaymentIntent = Awaited<
  ReturnType<Stripe.Stripe["paymentIntents"]["retrieve"]>
>;
type StripeCharge = Awaited<ReturnType<Stripe.Stripe["charges"]["retrieve"]>>;
type StripeEvent = ReturnType<Stripe.Stripe["webhooks"]["constructEvent"]>;
type StripeExpandableId = string | { id: string } | null | undefined;

function toMinorCurrencyUnit(amount: number) {
  return Math.round(amount * 100);
}

function getStripeObjectId(value: StripeExpandableId) {
  return typeof value === "string" ? value : value?.id ?? null;
}

function mergePaymentMetadata(
  payment: Payment,
  metadata: Record<string, unknown>,
) {
  payment.metadata = {
    ...(payment.metadata ?? {}),
    ...metadata,
  };
}

function getCheckoutReturnUrl(
  paymentId: string,
  result: "success" | "cancelled",
) {
  const sessionParam =
    result === "success" ? "&session_id={CHECKOUT_SESSION_ID}" : "";

  return `${env.CUSTOMER_APP_URL}/payment/checkout?paymentId=${paymentId}${sessionParam}&status=${result}`;
}

async function savePaymentAndBooking(
  payment: Payment,
  status: PaymentStatus,
) {
  payment.status = status;
  if (status === "paid") {
    payment.paidAt = payment.paidAt ?? new Date().toISOString();
  } else if (status !== "refunded") {
    payment.paidAt = null;
  }
  payment.failureReason = status === "failed" ? payment.failureReason : null;
  await paymentRepository().save(payment);

  payment.booking.paymentStatus = status;
  await bookingRepository().save(payment.booking);

  return payment;
}

async function findOwnedPayment(paymentId: string, userId: string) {
  const payment = await paymentRepository().findOne({
    where: { id: paymentId },
    relations: {
      booking: true,
    },
  });

  if (!payment) {
    throw new HttpError(404, "Payment not found.");
  }

  if (payment.userId !== userId && payment.booking.userId !== userId) {
    throw new HttpError(403, "You do not have access to this payment.");
  }

  return payment;
}

async function findPaymentForStripeSession(session: StripeCheckoutSession) {
  const paymentId = session.metadata?.paymentId;

  if (paymentId) {
    return paymentRepository().findOne({
      where: { id: paymentId },
      relations: {
        booking: true,
      },
    });
  }

  return paymentRepository().findOne({
    where: { providerSessionId: session.id },
    relations: {
      booking: true,
    },
  });
}

async function findPaymentForStripePaymentIntent(
  paymentIntent: StripePaymentIntent,
) {
  const metadataPaymentId = paymentIntent.metadata?.paymentId;

  if (metadataPaymentId) {
    return paymentRepository().findOne({
      where: { id: metadataPaymentId },
      relations: {
        booking: true,
      },
    });
  }

  return paymentRepository().findOne({
    where: { providerPaymentId: paymentIntent.id },
    relations: {
      booking: true,
    },
  });
}

async function applyStripeCheckoutSession(
  session: StripeCheckoutSession,
  statusHint?: PaymentStatus,
) {
  const payment = await findPaymentForStripeSession(session);

  if (!payment) {
    return null;
  }

  const paymentIntentId = getStripeObjectId(session.payment_intent);

  payment.provider = "stripe";
  payment.providerSessionId = session.id;
  payment.providerPaymentId = paymentIntentId ?? payment.providerPaymentId;
  mergePaymentMetadata(payment, {
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    stripePaymentStatus: session.payment_status,
    stripeSessionStatus: session.status,
  });

  if (
    statusHint === "paid" ||
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  ) {
    return savePaymentAndBooking(payment, "paid");
  }

  if (statusHint === "failed" || session.status === "expired") {
    payment.failureReason =
      statusHint === "failed"
        ? "Stripe checkout payment failed."
        : "Stripe checkout session expired.";
    return savePaymentAndBooking(payment, "failed");
  }

  await paymentRepository().save(payment);
  return payment;
}

async function applyStripePaymentIntentFailure(
  paymentIntent: StripePaymentIntent,
) {
  const payment = await findPaymentForStripePaymentIntent(paymentIntent);

  if (!payment || payment.status === "paid") {
    return payment;
  }

  payment.provider = "stripe";
  payment.providerPaymentId = paymentIntent.id;
  payment.failureReason =
    paymentIntent.last_payment_error?.message || "Stripe payment failed.";
  mergePaymentMetadata(payment, {
    stripePaymentIntentId: paymentIntent.id,
    stripePaymentIntentStatus: paymentIntent.status,
  });

  return savePaymentAndBooking(payment, "failed");
}

async function applyStripeChargeRefund(charge: StripeCharge) {
  const payment = await findPaymentForStripeCharge(charge);

  if (!payment) {
    return null;
  }

  payment.receiptUrl = charge.receipt_url ?? payment.receiptUrl;
  mergePaymentMetadata(payment, {
    stripeChargeId: charge.id,
    stripeAmountRefunded: charge.amount_refunded,
  });

  if (charge.refunded || charge.amount_refunded >= charge.amount) {
    return savePaymentAndBooking(payment, "refunded");
  }

  await paymentRepository().save(payment);
  return payment;
}

async function findPaymentForStripeCharge(charge: StripeCharge) {
  const metadataPaymentId = charge.metadata?.paymentId;

  if (metadataPaymentId) {
    return paymentRepository().findOne({
      where: { id: metadataPaymentId },
      relations: {
        booking: true,
      },
    });
  }

  const paymentIntentId = getStripeObjectId(charge.payment_intent);

  if (!paymentIntentId) {
    return null;
  }

  return paymentRepository().findOne({
    where: { providerPaymentId: paymentIntentId },
    relations: {
      booking: true,
    },
  });
}

async function applyStripeChargeReceipt(charge: StripeCharge) {
  const payment = await findPaymentForStripeCharge(charge);

  if (!payment) {
    return null;
  }

  payment.receiptUrl = charge.receipt_url ?? payment.receiptUrl;
  mergePaymentMetadata(payment, {
    stripeChargeId: charge.id,
  });

  await paymentRepository().save(payment);
  return payment;
}

export const paymentService = {
  async getPaymentForUser(paymentId: string, userId: string) {
    const payment = await findOwnedPayment(paymentId, userId);
    return {
      payment,
      booking: payment.booking,
    };
  },

  async createStripeCheckoutSessionForUser(paymentId: string, userId: string) {
    const payment = await findOwnedPayment(paymentId, userId);

    if (payment.method !== "online") {
      throw new HttpError(400, "This payment is not an online payment.");
    }

    if (payment.status === "paid") {
      return {
        message: "Payment is already completed.",
        payment,
        checkoutUrl: null,
        sessionId: payment.providerSessionId,
      };
    }

    if (payment.status === "refunded") {
      throw new HttpError(400, "This payment has already been refunded.");
    }

    if (payment.amount <= 0) {
      throw new HttpError(400, "Payment amount must be greater than zero.");
    }

    const stripe = getStripeClient();

    if (payment.providerSessionId && payment.status === "pending") {
      const existingSession = await stripe.checkout.sessions.retrieve(
        payment.providerSessionId,
      );

      const syncedPayment = await applyStripeCheckoutSession(existingSession);

      if (syncedPayment?.status === "paid") {
        return {
          message: "Payment is already completed.",
          payment: syncedPayment,
          checkoutUrl: null,
          sessionId: existingSession.id,
        };
      }

      if (existingSession.status === "open" && existingSession.url) {
        return {
          message: "Stripe checkout session is ready.",
          payment: syncedPayment ?? payment,
          checkoutUrl: existingSession.url,
          sessionId: existingSession.id,
        };
      }
    }

    const metadata = {
      paymentId: payment.id,
      bookingId: payment.bookingId,
      userId: payment.userId ?? "",
      bookingReference: payment.booking.bookingReference,
      checkoutReference: payment.checkoutReference,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payment.payerEmail,
      client_reference_id: payment.checkoutReference,
      line_items: [
        {
          price_data: {
            currency: payment.currency.toLowerCase(),
            product_data: {
              name: payment.booking.serviceTitle,
              description: `Booking ${payment.booking.bookingReference}`,
              metadata,
            },
            unit_amount: toMinorCurrencyUnit(payment.amount),
          },
          quantity: 1,
        },
      ],
      metadata,
      payment_intent_data: {
        metadata,
      },
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },
      success_url: getCheckoutReturnUrl(payment.id, "success"),
      cancel_url: getCheckoutReturnUrl(payment.id, "cancelled"),
    });

    if (!session.url) {
      throw new HttpError(502, "Stripe did not return a checkout URL.");
    }

    payment.provider = "stripe";
    payment.providerSessionId = session.id;
    payment.providerPaymentId =
      getStripeObjectId(session.payment_intent) ?? payment.providerPaymentId;
    payment.status = "pending";
    payment.failureReason = null;
    mergePaymentMetadata(payment, {
      stripeCheckoutSessionId: session.id,
      stripePaymentStatus: session.payment_status,
      stripeSessionStatus: session.status,
    });
    await paymentRepository().save(payment);

    return {
      message: "Stripe checkout session is ready.",
      payment,
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  },

  async syncStripeCheckoutSessionForUser(
    paymentId: string,
    userId: string,
    sessionId?: string,
  ) {
    const payment = await findOwnedPayment(paymentId, userId);
    const resolvedSessionId = sessionId || payment.providerSessionId;

    if (!resolvedSessionId) {
      return {
        message: "No Stripe checkout session is attached to this payment yet.",
        payment,
      };
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(resolvedSessionId);

    if (session.metadata?.paymentId && session.metadata.paymentId !== payment.id) {
      throw new HttpError(403, "Stripe session does not belong to this payment.");
    }

    const syncedPayment = await applyStripeCheckoutSession(session);

    return {
      message: "Payment status refreshed from Stripe.",
      payment: syncedPayment ?? payment,
    };
  },

  async completeMockPaymentForUser(paymentId: string, userId: string) {
    if (!env.ALLOW_MOCK_PAYMENTS) {
      throw new HttpError(
        403,
        "Mock payments are disabled. Use Stripe Checkout for online payments.",
      );
    }

    const payment = await findOwnedPayment(paymentId, userId);
    if (payment.method !== "online") {
      throw new HttpError(400, "This payment is not an online payment.");
    }

    return {
      message: "Payment completed successfully.",
      payment: await savePaymentAndBooking(payment, "paid"),
    };
  },

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    const payment = await paymentRepository().findOne({
      where: { id: paymentId },
      relations: {
        booking: true,
      },
    });

    if (!payment) {
      throw new HttpError(404, "Payment not found.");
    }

    return savePaymentAndBooking(payment, status);
  },

  async handleStripeWebhook(rawBody: Buffer | string, signature?: string) {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new HttpError(
        503,
        "Stripe webhook secret is not configured. Add STRIPE_WEBHOOK_SECRET to the backend environment.",
      );
    }

    if (!signature) {
      throw new HttpError(400, "Missing Stripe webhook signature.");
    }

    const stripe = getStripeClient();
    let event: StripeEvent;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      throw new HttpError(400, "Stripe webhook signature verification failed.");
    }

    switch (event.type) {
      case "checkout.session.completed":
        await applyStripeCheckoutSession(
          event.data.object as StripeCheckoutSession,
        );
        break;
      case "checkout.session.async_payment_succeeded":
        await applyStripeCheckoutSession(
          event.data.object as StripeCheckoutSession,
          "paid",
        );
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await applyStripeCheckoutSession(
          event.data.object as StripeCheckoutSession,
          "failed",
        );
        break;
      case "payment_intent.payment_failed":
        await applyStripePaymentIntentFailure(
          event.data.object as StripePaymentIntent,
        );
        break;
      case "charge.succeeded":
      case "charge.updated":
        await applyStripeChargeReceipt(event.data.object as StripeCharge);
        break;
      case "charge.refunded":
        await applyStripeChargeRefund(event.data.object as StripeCharge);
        break;
      default:
        break;
    }

    return {
      received: true,
      eventId: event.id,
      eventType: event.type,
    };
  },
};
