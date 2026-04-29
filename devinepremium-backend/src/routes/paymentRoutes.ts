import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { paymentService } from "../services/paymentService";
import { asyncHandler } from "../utils/http";

const router = Router();

const syncStripeSessionSchema = z.object({
  sessionId: z.string().min(1).optional(),
});

router.get(
  "/:paymentId",
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await paymentService.getPaymentForUser(
      String(req.params.paymentId),
      req.authUser!.id,
    );

    res.json({
      payment: {
        id: result.payment.id,
        status: result.payment.status,
        amount: result.payment.amount,
        currency: result.payment.currency,
        method: result.payment.method,
        provider: result.payment.provider,
        checkoutReference: result.payment.checkoutReference,
        providerSessionId: result.payment.providerSessionId,
        providerPaymentId: result.payment.providerPaymentId,
        receiptUrl: result.payment.receiptUrl,
        failureReason: result.payment.failureReason,
        paidAt: result.payment.paidAt,
        createdAt: result.payment.createdAt,
      },
      booking: {
        id: result.booking.id,
        bookingReference: result.booking.bookingReference,
        serviceTitle: result.booking.serviceTitle,
        paymentStatus: result.booking.paymentStatus,
      },
    });
  }),
);

router.post(
  "/:paymentId/checkout-session",
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await paymentService.createStripeCheckoutSessionForUser(
      String(req.params.paymentId),
      req.authUser!.id,
    );

    res.json({
      message: result.message,
      payment: result.payment,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
    });
  }),
);

router.post(
  "/:paymentId/sync-session",
  authenticate,
  asyncHandler(async (req, res) => {
    const input = syncStripeSessionSchema.parse(req.body);
    const result = await paymentService.syncStripeCheckoutSessionForUser(
      String(req.params.paymentId),
      req.authUser!.id,
      input.sessionId,
    );

    res.json({
      message: result.message,
      payment: result.payment,
    });
  }),
);

router.post(
  "/:paymentId/complete",
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await paymentService.completeMockPaymentForUser(
      String(req.params.paymentId),
      req.authUser!.id,
    );
    res.json({
      message: result.message,
      payment: result.payment,
    });
  }),
);

export default router;
