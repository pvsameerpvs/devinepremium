import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { paymentService } from "../services/paymentService";
import { asyncHandler } from "../utils/http";

const router = Router();

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
        method: result.payment.method,
      },
      booking: {
        bookingReference: result.booking.bookingReference,
        serviceTitle: result.booking.serviceTitle,
      },
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
