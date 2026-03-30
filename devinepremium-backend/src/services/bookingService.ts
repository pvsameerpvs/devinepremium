import { AppDataSource } from "../config/data-source";
import { Booking } from "../entities/Booking";
import { BookingStatusHistory } from "../entities/BookingStatusHistory";
import { Payment } from "../entities/Payment";
import {
  BookingAddress,
  BookingContact,
  BookingPricing,
  BookingSchedule,
  BookingStatus,
  PaymentMethod,
} from "../types/domain";
import { User } from "../entities/User";

interface CreateBookingInput {
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  serviceOptions: Record<string, unknown>;
  address: BookingAddress;
  schedule: BookingSchedule;
  contact: BookingContact;
  paymentMethod: PaymentMethod;
  pricing: BookingPricing;
}

const bookingRepository = () => AppDataSource.getRepository(Booking);
const paymentRepository = () => AppDataSource.getRepository(Payment);
const statusHistoryRepository = () =>
  AppDataSource.getRepository(BookingStatusHistory);
const userRepository = () => AppDataSource.getRepository(User);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createReference(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${stamp}-${random}`;
}

export const bookingService = {
  async createBookingForUser(input: CreateBookingInput, user: User) {
    const email = normalizeEmail(user.email);
    const booking = bookingRepository().create({
      bookingReference: createReference("DP"),
      serviceId: input.serviceId,
      serviceSlug: input.serviceSlug,
      serviceTitle: input.serviceTitle,
      serviceOptions: input.serviceOptions,
      address: input.address,
      schedule: input.schedule,
      pricing: input.pricing,
      status: "pending",
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "online" ? "pending" : "cash_due",
      contactName: input.contact.fullName.trim(),
      contactEmail: email,
      contactPhone: input.contact.phone?.trim() || null,
      notes: input.contact.instructions?.trim() || null,
      subtotal: input.pricing.subtotal,
      discountAmount: input.pricing.discount,
      vatAmount: input.pricing.vat,
      totalAmount: input.pricing.total,
      currency: "AED",
      userId: user.id,
    });

    const savedBooking = await bookingRepository().save(booking);

    const payment = paymentRepository().create({
      bookingId: savedBooking.id,
      userId: user.id,
      payerEmail: email,
      method: input.paymentMethod,
      provider: input.paymentMethod === "online" ? "mock-gateway" : "cash",
      status: input.paymentMethod === "online" ? "pending" : "cash_due",
      amount: input.pricing.total,
      currency: "AED",
      checkoutReference: createReference(
        input.paymentMethod === "online" ? "PAY" : "CASH",
      ),
      metadata: {
        serviceTitle: input.serviceTitle,
        lineItems: input.pricing.lineItems,
      },
      paidAt: null,
    });

    const savedPayment = await paymentRepository().save(payment);

    const history = statusHistoryRepository().create({
      bookingId: savedBooking.id,
      changedByUserId: user.id,
      fromStatus: null,
      toStatus: "pending",
      note: "Order created from customer frontend.",
    });

    await statusHistoryRepository().save(history);

    return {
      message:
        input.paymentMethod === "online"
          ? "Booking created. Continue to the online payment page."
          : "Booking created successfully. You can track it from your dashboard.",
      payment: savedPayment,
    };
  },

  async getUserBookingHistory(userId: string) {
    return bookingRepository()
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.payments", "payment")
      .leftJoinAndSelect("booking.statusHistory", "statusHistory")
      .where("booking.userId = :userId", { userId })
      .orderBy("booking.createdAt", "DESC")
      .addOrderBy("statusHistory.createdAt", "DESC")
      .addOrderBy("payment.createdAt", "DESC")
      .getMany();
  },

  async getUserBookingHistoryForAdmin(userId: string) {
    const user = await userRepository().findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const bookings = await this.getUserBookingHistory(userId);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      bookings,
    };
  },

  async listAdminBookings() {
    return bookingRepository()
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.user", "user")
      .leftJoinAndSelect("booking.payments", "payment")
      .leftJoinAndSelect("booking.statusHistory", "statusHistory")
      .orderBy("booking.createdAt", "DESC")
      .addOrderBy("statusHistory.createdAt", "DESC")
      .addOrderBy("payment.createdAt", "DESC")
      .getMany();
  },

  async getAdminDashboard() {
    const bookings = await this.listAdminBookings();
    const summary = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((booking) => booking.status === "pending")
        .length,
      activeBookings: bookings.filter((booking) =>
        ["accepted", "scheduled", "in_progress"].includes(booking.status),
      ).length,
      completedBookings: bookings.filter(
        (booking) => booking.status === "completed",
      ).length,
      paidBookings: bookings.filter((booking) => booking.paymentStatus === "paid")
        .length,
      cashDueBookings: bookings.filter(
        (booking) => booking.paymentStatus === "cash_due",
      ).length,
      revenueCollected: bookings
        .filter((booking) => booking.paymentStatus === "paid")
        .reduce((total, booking) => total + booking.totalAmount, 0),
    };

    return {
      summary,
      bookings,
    };
  },

  async updateBookingStatus(
    bookingId: string,
    toStatus: BookingStatus,
    changedByUserId: string,
    note?: string,
  ) {
    const booking = await bookingRepository().findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    const previousStatus = booking.status;
    booking.status = toStatus;
    await bookingRepository().save(booking);

    const history = statusHistoryRepository().create({
      bookingId: booking.id,
      changedByUserId,
      fromStatus: previousStatus,
      toStatus,
      note: note?.trim() || null,
    });

    await statusHistoryRepository().save(history);

    return booking;
  },

  async attachGuestRecordsToUser(userId: string, email: string) {
    const normalizedEmail = normalizeEmail(email);

    await bookingRepository()
      .createQueryBuilder()
      .update(Booking)
      .set({ userId })
      .where("userId IS NULL")
      .andWhere("LOWER(contactEmail) = :email", { email: normalizedEmail })
      .execute();

    await paymentRepository()
      .createQueryBuilder()
      .update(Payment)
      .set({ userId })
      .where("userId IS NULL")
      .andWhere("LOWER(payerEmail) = :email", { email: normalizedEmail })
      .execute();
  },
};
