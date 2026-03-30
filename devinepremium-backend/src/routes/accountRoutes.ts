import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { accountService } from "../services/accountService";
import { asyncHandler } from "../utils/http";

const router = Router();

const profileSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
  defaultInstructions: z.string().optional(),
});

const savedAddressSchema = z.object({
  label: z.string().min(2),
  location: z.string().min(1),
  building: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().min(1),
  mapLink: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  isDefault: z.boolean().optional(),
});

router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const account = await accountService.getAccount(req.authUser!.id);
    res.json(account);
  }),
);

router.patch(
  "/profile",
  asyncHandler(async (req, res) => {
    const input = profileSchema.parse(req.body);
    const result = await accountService.updateProfile(req.authUser!.id, input);
    res.json({
      message: "Profile updated successfully.",
      ...result,
    });
  }),
);

router.post(
  "/addresses",
  asyncHandler(async (req, res) => {
    const input = savedAddressSchema.parse(req.body);
    const result = await accountService.createSavedAddress(req.authUser!.id, input);
    res.status(201).json({
      message: "Saved address added successfully.",
      ...result,
    });
  }),
);

router.patch(
  "/addresses/:addressId",
  asyncHandler(async (req, res) => {
    const input = savedAddressSchema.parse(req.body);
    const result = await accountService.updateSavedAddress(
      req.authUser!.id,
      String(req.params.addressId),
      input,
    );
    res.json({
      message: "Saved address updated successfully.",
      ...result,
    });
  }),
);

router.delete(
  "/addresses/:addressId",
  asyncHandler(async (req, res) => {
    const result = await accountService.deleteSavedAddress(
      req.authUser!.id,
      String(req.params.addressId),
    );
    res.json(result);
  }),
);

export default router;
