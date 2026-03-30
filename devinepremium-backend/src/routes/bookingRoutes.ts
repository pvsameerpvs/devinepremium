import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { authService } from "../services/authService";
import { bookingService } from "../services/bookingService";
import { PAYMENT_METHODS } from "../types/domain";
import { asyncHandler } from "../utils/http";

const router = Router();

const createPublicBookingSchema = z.object({
  serviceId: z.string().min(1),
  serviceSlug: z.string().min(1),
  serviceTitle: z.string().min(1),
  serviceOptions: z.record(z.string(), z.any()),
  address: z.object({
    location: z.string().min(1),
    building: z.string().optional(),
    apartment: z.string().optional(),
    city: z.string().min(1),
    mapLink: z.string().optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
  }),
  schedule: z.object({
    date: z.string().min(1),
    timeSlot: z.string().min(1),
  }),
  contact: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    instructions: z.string().optional(),
  }),
  paymentMethod: z.enum(PAYMENT_METHODS),
  pricing: z.object({
    subtotal: z.number(),
    discount: z.number(),
    vat: z.number(),
    total: z.number(),
    lineItems: z.array(
      z.object({
        label: z.string(),
        amount: z.number(),
      }),
    ),
  }),
});

router.post(
  "/public",
  asyncHandler(async (req, res) => {
    const input = createPublicBookingSchema.parse(req.body);
    const result = await bookingService.createPublicBooking(input);
    res.status(201).json(result);
  }),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.authUser!.id);

    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    const bookings = await bookingService.getUserBookingHistory(user.id);

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      bookings,
    });
  }),
);

export default router;
