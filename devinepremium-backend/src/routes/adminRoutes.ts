import { Router } from "express";
import { z } from "zod";
import { authenticate, requireAdmin } from "../middleware/auth";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { staffService } from "../services/staffService";
import {
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  STAFF_AVAILABILITY_DAYS,
} from "../types/domain";
import { asyncHandler } from "../utils/http";

const router = Router();

const updateBookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  note: z.string().optional(),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
});

const resolveCustomerRequestSchema = z.object({
  decision: z.enum(["approved", "declined"]),
  note: z.string().optional(),
});

const staffDaySchema = z.enum(STAFF_AVAILABILITY_DAYS);

const createStaffSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().optional(),
  phone: z.string().optional(),
  availabilityDays: z.array(staffDaySchema).min(1),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateStaffSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  availabilityDays: z.array(staffDaySchema).min(1).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

const assignStaffSchema = z.object({
  staffId: z.string().uuid().nullable().optional(),
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
  "/staff",
  asyncHandler(async (_req, res) => {
    const staffMembers = await staffService.listStaffMembers();
    res.json({ staffMembers });
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
  "/bookings/:bookingId/assign-staff",
  asyncHandler(async (req, res) => {
    const input = assignStaffSchema.parse(req.body);
    const booking = await bookingService.assignStaffToBooking(
      String(req.params.bookingId),
      input.staffId ?? null,
      req.authUser!.id,
    );

    res.json({
      message: input.staffId
        ? "Staff assigned successfully."
        : "Staff assignment cleared successfully.",
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

router.patch(
  "/bookings/:bookingId/customer-request",
  asyncHandler(async (req, res) => {
    const input = resolveCustomerRequestSchema.parse(req.body);
    const booking = await bookingService.resolveCustomerRequest(
      String(req.params.bookingId),
      req.authUser!.id,
      input,
    );

    res.json({
      message: "Customer request updated successfully.",
      booking,
    });
  }),
);

router.post(
  "/staff",
  asyncHandler(async (req, res) => {
    const input = createStaffSchema.parse(req.body);
    const staffMember = await staffService.createStaffMember(input);

    res.status(201).json({
      message: "Staff member created successfully.",
      staffMember,
    });
  }),
);

router.patch(
  "/staff/:staffId",
  asyncHandler(async (req, res) => {
    const input = updateStaffSchema.parse(req.body);
    const staffMember = await staffService.updateStaffMember(
      String(req.params.staffId),
      input,
    );

    res.json({
      message: "Staff member updated successfully.",
      staffMember,
    });
  }),
);

export default router;
