import { Router } from "express";
import { z } from "zod";
import { authenticate, requireAdmin } from "../middleware/auth";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { serviceCatalogService } from "../services/serviceCatalogService";
import { staffService } from "../services/staffService";
import {
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  SERVICE_PRICING_MODES,
  STAFF_AVAILABILITY_DAYS,
} from "../types/domain";
import multer from "multer";
import { createSupabaseAuthClient } from "../lib/supabase";
import { asyncHandler } from "../utils/http";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
  slug: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  availabilityDays: z.array(staffDaySchema).min(1),
  notes: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  documentImageUrls: z.array(z.string()).max(8).optional(),
  isActive: z.boolean().optional(),
});

const updateStaffSchema = z.object({
  fullName: z.string().min(2).optional(),
  slug: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  availabilityDays: z.array(staffDaySchema).min(1).optional(),
  notes: z.string().optional(),
  profilePhotoUrl: z.string().optional(),
  documentImageUrls: z.array(z.string()).max(8).optional(),
  isActive: z.boolean().optional(),
});

const assignStaffSchema = z.object({
  staffId: z.string().uuid().nullable().optional(),
});

const serviceOptionChoiceSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  price: z.number().min(0).optional(),
});

const serviceOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  price: z.number().min(0).optional(),
  min: z.number().min(0).optional(),
  type: z.enum(["checkbox", "radio", "quantity", "select"]),
  options: z.array(serviceOptionChoiceSchema).optional(),
  defaultValue: z.unknown().optional(),
});

const servicePayloadSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  basePrice: z.number().min(0).optional(),
  priceUnit: z.string().nullable().optional(),
  pricingMode: z.enum(SERVICE_PRICING_MODES),
  pricingConfig: z.record(z.string(), z.any()).optional(),
  options: z.array(serviceOptionSchema).optional(),
  expectations: z.array(z.string()).optional(),
  categoryId: z.string().uuid().nullable().optional(),
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
  "/services",
  asyncHandler(async (_req, res) => {
    const services = await serviceCatalogService.listServices();
    res.json({ services });
  }),
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await serviceCatalogService.listCategories();
    res.json({ categories });
  }),
);

router.post(
  "/services/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded." });
      return;
    }

    const supabase = createSupabaseAuthClient();
    const file = req.file;
    const fileExt = file.originalname.split(".").pop() || "bin";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `catalog/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from("services")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("services").getPublicUrl(filePath);

      res.json({
        message: "File uploaded successfully.",
        url: publicUrl,
      });
    } catch (uploadError) {
      console.error("Service image upload failed:", uploadError);
      res.status(500).json({
        message: uploadError instanceof Error ? uploadError.message : "Failed to upload image.",
      });
    }
  }),
);

router.post(
  "/services",
  asyncHandler(async (req, res) => {
    const input = servicePayloadSchema.parse(req.body);
    const service = await serviceCatalogService.createService(input);

    res.status(201).json({
      message: "Service created successfully.",
      service,
    });
  }),
);

router.patch(
  "/services/:serviceId",
  asyncHandler(async (req, res) => {
    const input = servicePayloadSchema.parse(req.body);
    const service = await serviceCatalogService.updateService(
      String(req.params.serviceId),
      input,
    );

    res.json({
      message: "Service updated successfully.",
      service,
    });
  }),
);

router.delete(
  "/services/:serviceId",
  asyncHandler(async (req, res) => {
    const service = await serviceCatalogService.deleteService(
      String(req.params.serviceId),
    );

    res.json({
      message: "Service deleted successfully.",
      service,
    });
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

router.post(
  "/staff/:staffId/delete",
  asyncHandler(async (req, res) => {
    const staffMember = await staffService.deleteStaffMember(
      String(req.params.staffId),
    );

    res.json({
      message: "Staff member deleted successfully.",
      staffMember,
    });
  }),
);

router.delete(
  "/staff/:staffId",
  asyncHandler(async (req, res) => {
    const staffMember = await staffService.deleteStaffMember(
      String(req.params.staffId),
    );

    res.json({
      message: "Staff member deleted successfully.",
      staffMember,
    });
  }),
);

export default router;
