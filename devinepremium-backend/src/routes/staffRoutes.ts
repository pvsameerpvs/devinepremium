import { Router } from "express";
import { z } from "zod";
import { authenticateStaff } from "../middleware/staffAuth";
import { staffService } from "../services/staffService";
import { PAYMENT_STATUSES } from "../types/domain";
import { asyncHandler } from "../utils/http";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(["in_progress", "completed"]),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await staffService.loginStaff(input.email, input.password);
    res.json(result);
  }),
);

router.use(authenticateStaff);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const staffMember = await staffService.getStaffMember(req.staffUser!.id);
    res.json({ staffMember });
  }),
);

router.get(
  "/bookings",
  asyncHandler(async (req, res) => {
    const date =
      typeof req.query.date === "string" ? req.query.date : undefined;
    const bookings = await staffService.getStaffBookings(
      req.staffUser!.id,
      date,
    );
    res.json({ bookings });
  }),
);

router.patch(
  "/bookings/:bookingId/status",
  asyncHandler(async (req, res) => {
    const input = updateStatusSchema.parse(req.body);
    const booking = await staffService.updateBookingStatus(
      req.staffUser!.id,
      String(req.params.bookingId),
      input.status,
    );
    res.json({ message: "Booking status updated.", booking });
  }),
);

router.patch(
  "/bookings/:bookingId/payment-status",
  asyncHandler(async (req, res) => {
    const input = updatePaymentStatusSchema.parse(req.body);
    const payment = await staffService.updatePaymentStatus(
      req.staffUser!.id,
      String(req.params.bookingId),
      input.status,
    );
    res.json({ message: "Payment status updated.", payment });
  }),
);

export default router;
