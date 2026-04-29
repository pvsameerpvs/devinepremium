import { Router } from "express";
import { paymentService } from "../services/paymentService";
import { asyncHandler } from "../utils/http";

const router = Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const result = await paymentService.handleStripeWebhook(
      req.body as Buffer,
      req.header("stripe-signature") ?? undefined,
    );

    res.json(result);
  }),
);

export default router;
