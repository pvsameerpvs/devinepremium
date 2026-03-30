import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { authService } from "../services/authService";
import { asyncHandler } from "../utils/http";

const router = Router();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const googleLoginSchema = z.object({
  accessToken: z.string().min(1),
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    res.status(201).json(result);
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  }),
);

router.post(
  "/google",
  asyncHandler(async (req, res) => {
    const input = googleLoginSchema.parse(req.body);
    const result = await authService.loginWithGoogle(input);
    res.json(result);
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

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  }),
);

export default router;
