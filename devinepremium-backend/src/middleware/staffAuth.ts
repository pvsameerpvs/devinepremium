import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { StaffMember } from "../entities/StaffMember";
import { verifyAuthToken } from "../utils/jwt";
import { asyncHandler } from "../utils/http";

export const authenticateStaff = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const token = authorization.replace("Bearer ", "").trim();
    let payload;

    try {
      payload = verifyAuthToken(token);
    } catch (error) {
      const isExpired =
        error instanceof Error && error.name === "TokenExpiredError";
      res.status(401).json({
        message: isExpired
          ? "Your session expired. Please log in again."
          : "Invalid session token.",
      });
      return;
    }

    if (payload.role !== "staff") {
      res.status(403).json({ message: "Staff access required." });
      return;
    }

    const staffMember = await AppDataSource.getRepository(StaffMember).findOne(
      { where: { id: payload.sub } },
    );

    if (!staffMember) {
      res.status(401).json({ message: "Staff member not found." });
      return;
    }

    if (!staffMember.isActive) {
      res.status(403).json({ message: "Account is deactivated." });
      return;
    }

    req.staffUser = {
      id: staffMember.id,
      fullName: staffMember.fullName,
      email: staffMember.email,
    };

    next();
  },
);
