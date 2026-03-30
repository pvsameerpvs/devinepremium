import { Router } from "express";
import { paymentService } from "../services/paymentService";
import { asyncHandler } from "../utils/http";

const router = Router();

router.get(
  "/public/:paymentId",
  asyncHandler(async (req, res) => {
    const result = await paymentService.getPublicPayment(
      String(req.params.paymentId),
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
  "/public/:paymentId/complete",
  asyncHandler(async (req, res) => {
    const result = await paymentService.completeMockPayment(
      String(req.params.paymentId),
    );
    res.json({
      message: result.message,
      payment: result.payment,
    });
  }),
);

export default router;
