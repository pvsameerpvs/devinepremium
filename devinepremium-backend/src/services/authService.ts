import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { signAuthToken } from "../utils/jwt";
import { bookingService } from "./bookingService";

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const userRepository = () => AppDataSource.getRepository(User);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toSafeUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

function createToken(user: User) {
  return signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });
}

export const authService = {
  async register(input: RegisterInput) {
    const email = normalizeEmail(input.email);
    const existing = await userRepository().findOne({
      where: { email },
    });

    if (existing) {
      throw new Error("This email is already registered.");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = userRepository().create({
      fullName: input.fullName.trim(),
      email,
      phone: input.phone?.trim() || null,
      passwordHash,
      role: "user",
    });

    const savedUser = await userRepository().save(user);
    await bookingService.attachGuestRecordsToUser(savedUser.id, savedUser.email);

    return {
      message: "Account created successfully.",
      token: createToken(savedUser),
      user: toSafeUser(savedUser),
    };
  },

  async login(input: LoginInput) {
    const email = normalizeEmail(input.email);
    const user = await userRepository()
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("LOWER(user.email) = :email", { email })
      .getOne();

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new Error("Invalid email or password.");
    }

    await bookingService.attachGuestRecordsToUser(user.id, user.email);

    return {
      message: "Login successful.",
      token: createToken(user),
      user: toSafeUser(user),
    };
  },

  async getUserById(userId: string) {
    return userRepository().findOne({
      where: { id: userId },
    });
  },

  async ensureSeedAdminUser(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await userRepository().findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return existing;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = userRepository().create({
      fullName: "Devine Premium Admin",
      email: normalizedEmail,
      phone: null,
      passwordHash,
      role: "admin",
    });

    return userRepository().save(admin);
  },
};
