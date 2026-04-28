import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { verifyAuthToken } from "../utils/jwt";
import { asyncHandler } from "../utils/http";

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const token = authorization.replace("Bearer ", "").trim();
    let payload;

    try {
      payload = verifyAuthToken(token);
    } catch (error) {
      const isExpiredToken =
        error instanceof Error && error.name === "TokenExpiredError";

      res.status(401).json({
        message: isExpiredToken
          ? "Your session expired. Please log in again."
          : "Invalid session token.",
      });
      return;
    }

    const user = await authService.getUserById(payload.sub);

    if (!user) {
      res.status(401).json({
        message: "Session is no longer valid.",
      });
      return;
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    next();
  },
);

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.authUser || req.authUser.role !== "admin") {
    res.status(403).json({
      message: "Admin access required.",
    });
    return;
  }

  next();
}
