import { AppDataSource } from "../config/data-source";
import { Booking } from "../entities/Booking";
import { Payment } from "../entities/Payment";
import { PaymentStatus } from "../types/domain";

const paymentRepository = () => AppDataSource.getRepository(Payment);
const bookingRepository = () => AppDataSource.getRepository(Booking);

export const paymentService = {
  async getPublicPayment(paymentId: string) {
    const payment = await paymentRepository().findOne({
      where: { id: paymentId },
      relations: {
        booking: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    return {
      payment,
      booking: payment.booking,
    };
  },

  async completeMockPayment(paymentId: string) {
    const payment = await paymentRepository().findOne({
      where: { id: paymentId },
      relations: {
        booking: true,
      },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

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
