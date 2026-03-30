import { Router } from "express";
import { z } from "zod";
import { authenticate, requireAdmin } from "../middleware/auth";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "../types/domain";
import { asyncHandler } from "../utils/http";

const router = Router();

const updateBookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  note: z.string().optional(),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
});

router.use(authenticate, requireAdmin);

router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const dashboard = await bookingService.getAdminDashboard();
    res.json(dashboard);
  }),
);

router.get(
  "/bookings",
  asyncHandler(async (_req, res) => {
    const bookings = await bookingService.listAdminBookings();
    res.json({ bookings });
  }),
);

router.get(
  "/users/:userId/history",
  asyncHandler(async (req, res) => {
    const history = await bookingService.getUserBookingHistoryForAdmin(
      String(req.params.userId),
    );
    res.json(history);
  }),
);

router.patch(
  "/bookings/:bookingId/status",
  asyncHandler(async (req, res) => {
    const input = updateBookingStatusSchema.parse(req.body);
    const booking = await bookingService.updateBookingStatus(
      String(req.params.bookingId),
      input.status,
      req.authUser!.id,
      input.note,
    );

    res.json({
      message: "Booking status updated successfully.",
      booking,
    });
  }),
);

router.patch(
  "/payments/:paymentId/status",
  asyncHandler(async (req, res) => {
    const input = updatePaymentStatusSchema.parse(req.body);
    const payment = await paymentService.updatePaymentStatus(
      String(req.params.paymentId),
      input.status,
    );

    res.json({
      message: "Payment status updated successfully.",
      payment,
    });
  }),
);

export default router;
