import { AppDataSource } from "../config/data-source";
import { Booking } from "../entities/Booking";
import { Payment } from "../entities/Payment";
import { PaymentStatus } from "../types/domain";

const paymentRepository = () => AppDataSource.getRepository(Payment);
const bookingRepository = () => AppDataSource.getRepository(Booking);

async function findOwnedPayment(paymentId: string, userId: string) {
  const payment = await paymentRepository().findOne({
    where: { id: paymentId },
    relations: {
      booking: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (payment.userId !== userId && payment.booking.userId !== userId) {
    throw new Error("You do not have access to this payment.");
  }

  return payment;
}

export const paymentService = {
  async getPaymentForUser(paymentId: string, userId: string) {
    const payment = await findOwnedPayment(paymentId, userId);
    return {
      payment,
      booking: payment.booking,
    };
  },

  async completeMockPaymentForUser(paymentId: string, userId: string) {
    const payment = await findOwnedPayment(paymentId, userId);
    if (payment.method !== "online") {
      throw new Error("This payment is not an online payment.");
    }

    payment.status = "paid";
    payment.paidAt = new Date().toISOString();
    await paymentRepository().save(payment);

    payment.booking.paymentStatus = "paid";
    await bookingRepository().save(payment.booking);

    return {
      message: "Payment completed successfully.",
      payment,
    };
  },

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    const payment = await paymentRepository().findOne({
      where: { id: paymentId },
      relations: {
        booking: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    payment.status = status;
    payment.paidAt = status === "paid" ? new Date().toISOString() : null;
    await paymentRepository().save(payment);

    payment.booking.paymentStatus = status;
    await bookingRepository().save(payment.booking);

    return payment;
  },
};
