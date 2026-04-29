import { AppDataSource } from "../config/data-source";
import { Booking } from "../entities/Booking";
import { BookingStatusHistory } from "../entities/BookingStatusHistory";
import { Payment } from "../entities/Payment";
import { StaffMember } from "../entities/StaffMember";
import { User } from "../entities/User";
import { accountService } from "./accountService";
import {
  isStaffAvailableForDate,
  staffService,
} from "./staffService";
import {
  BookingAddress,
  BookingChangeRequestStatus,
  BookingChangeRequestType,
  BookingContact,
  BookingPricing,
  BookingSchedule,
  BookingStatus,
  PaymentMethod,
  SavedAddressInput,
} from "../types/domain";
import { HttpError } from "../utils/http";
import { serviceCatalogService } from "./serviceCatalogService";

interface CreateBookingInput {
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  serviceOptions: Record<string, unknown>;
  address: BookingAddress;
  schedule: BookingSchedule;
  contact: BookingContact;
  paymentMethod: PaymentMethod;
  pricing?: BookingPricing;
  saveAddress?: {
    label: string;
    isDefault?: boolean;
  };
}

const bookingRepository = () => AppDataSource.getRepository(Booking);
const paymentRepository = () => AppDataSource.getRepository(Payment);
const statusHistoryRepository = () =>
  AppDataSource.getRepository(BookingStatusHistory);
const userRepository = () => AppDataSource.getRepository(User);
const staffRepository = () => AppDataSource.getRepository(StaffMember);
const SLOT_BLOCKING_STATUSES: BookingStatus[] = [
  "pending",
  "accepted",
  "scheduled",
  "in_progress",
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

function normalizeAddressKey(address: BookingAddress) {
  return [
    normalizeText(address.city),
    normalizeText(address.location),
    normalizeText(address.building),
    normalizeText(address.apartment),
  ]
    .filter(Boolean)
    .join("|");
}

function isSameSchedule(left: BookingSchedule, right: BookingSchedule) {
  return (
    normalizeText(left.date) === normalizeText(right.date) &&
    normalizeText(left.timeSlot) === normalizeText(right.timeSlot)
  );
}

function doesBookingBlockSlot(booking: Pick<Booking, "status">) {
  return SLOT_BLOCKING_STATUSES.includes(booking.status);
}

function createReference(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${stamp}-${random}`;
}

function canCustomerManageBooking(booking: Booking) {
  return !["completed", "cancelled", "rejected"].includes(booking.status);
}

function toCustomerRequestNote(
  type: BookingChangeRequestType,
  note?: string,
  schedule?: BookingSchedule,
) {
  if (type === "cancel") {
    return note?.trim()
      ? `Customer requested cancellation. ${note.trim()}`
      : "Customer requested cancellation.";
  }

  const scheduleText = schedule
    ? `Requested new schedule: ${schedule.date} at ${schedule.timeSlot}.`
    : "Customer requested a new schedule.";

  return note?.trim() ? `${scheduleText} ${note.trim()}` : scheduleText;
}

async function createStatusHistoryEntry(input: {
  bookingId: string;
  changedByUserId: string | null;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  note?: string | null;
}) {
  const history = statusHistoryRepository().create({
    bookingId: input.bookingId,
    changedByUserId: input.changedByUserId,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    note: input.note?.trim() || null,
  });

  await statusHistoryRepository().save(history);
}

async function getOwnedBooking(bookingId: string, userId: string) {
  const booking = await bookingRepository().findOne({
    where: {
      id: bookingId,
      userId,
    },
    relations: {
      payments: true,
      statusHistory: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  return booking;
}

async function listActiveBookingsForSchedule(
  schedule: BookingSchedule,
  excludeBookingId?: string,
) {
  const bookings = await bookingRepository().find({
    relations: {
      assignedStaff: true,
    },
  });

  return bookings.filter(
    (booking) =>
      booking.id !== excludeBookingId &&
      doesBookingBlockSlot(booking) &&
      isSameSchedule(booking.schedule, schedule),
  );
}

async function assertSlotCapacityAvailable(
  schedule: BookingSchedule,
  excludeBookingId?: string,
) {
  const [slotBookings, staffMembers] = await Promise.all([
    listActiveBookingsForSchedule(schedule, excludeBookingId),
    staffService.listStaffMembers(),
  ]);

  const activeStaffMembers = staffMembers.filter((staffMember) => staffMember.isActive);

  if (!activeStaffMembers.length) {
    return slotBookings;
  }

  const availableStaffMembers = activeStaffMembers.filter((staffMember) =>
    isStaffAvailableForDate(staffMember, schedule.date),
  );

  if (!availableStaffMembers.length) {
    throw new HttpError(
      409,
      "No staff are available on the selected date. Please choose another day.",
    );
  }

  if (slotBookings.length >= availableStaffMembers.length) {
    throw new HttpError(
      409,
      "The selected time slot is already full for the available team. Please choose another time.",
    );
  }

  return slotBookings;
}

async function assertUserSlotRules(input: {
  address: BookingAddress;
  excludeBookingId?: string;
  schedule: BookingSchedule;
  serviceId: string;
  userId: string;
}) {
  const slotBookings = await assertSlotCapacityAvailable(
    input.schedule,
    input.excludeBookingId,
  );
  const userSlotBookings = slotBookings.filter(
    (booking) => booking.userId === input.userId,
  );

  const sameAddressBooking = userSlotBookings.find(
    (booking) => normalizeAddressKey(booking.address) === normalizeAddressKey(input.address),
  );

  if (sameAddressBooking?.serviceId === input.serviceId) {
    throw new HttpError(
      409,
      "You already booked this service for the same address, date, and time.",
    );
  }

  if (sameAddressBooking) {
    throw new HttpError(
      409,
      "You already have another service booked for the same address, date, and time. Please choose another slot or combine it into the same visit.",
    );
  }

  if (userSlotBookings.length) {
    throw new HttpError(
      409,
      "You already have another booking at the same date and time. Please choose a different slot.",
    );
  }
}

async function findStaffSlotConflict(input: {
  schedule: BookingSchedule;
  staffId: string;
  excludeBookingId?: string;
}) {
  const slotBookings = await listActiveBookingsForSchedule(
    input.schedule,
    input.excludeBookingId,
  );

  return (
    slotBookings.find((booking) => booking.assignedStaffId === input.staffId) ?? null
  );
}

async function assertStaffHasNoSlotConflict(input: {
  schedule: BookingSchedule;
  staffId: string;
  excludeBookingId?: string;
}) {
  const staffConflict = await findStaffSlotConflict(input);

  if (staffConflict) {
    throw new HttpError(
      409,
      "Selected staff member already has another booking at the same date and time.",
    );
  }
}

export const bookingService = {
  async createBookingForUser(input: CreateBookingInput, user: User) {
    const email = normalizeEmail(user.email);
    const service = await serviceCatalogService.getServiceBySlug(
      input.serviceSlug,
      { activeOnly: true },
    );
    const pricing = serviceCatalogService.calculatePricing(
      service,
      input.serviceOptions,
    );
    const serviceSnapshot = serviceCatalogService.createServiceSnapshot(service);

    await assertUserSlotRules({
      userId: user.id,
      serviceId: service.id,
      address: input.address,
      schedule: input.schedule,
    });

    const booking = bookingRepository().create({
      bookingReference: createReference("DP"),
      serviceId: service.id,
      serviceSlug: service.slug,
      serviceTitle: service.title,
      serviceOptions: input.serviceOptions,
      serviceSnapshot,
      address: input.address,
      schedule: input.schedule,
      pricing,
      status: "pending",
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "online" ? "pending" : "cash_due",
      contactName: input.contact.fullName.trim(),
      contactEmail: email,
      contactPhone: input.contact.phone?.trim() || null,
      notes: input.contact.instructions?.trim() || null,
      customerRequest: null,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discount,
      vatAmount: pricing.vat,
      totalAmount: pricing.total,
      currency: "AED",
      userId: user.id,
      assignedStaffId: null,
      assignedAt: null,
    });

    const savedBooking = await bookingRepository().save(booking);

    const payment = paymentRepository().create({
      bookingId: savedBooking.id,
      userId: user.id,
      payerEmail: email,
      method: input.paymentMethod,
      provider: input.paymentMethod === "online" ? "stripe" : "cash",
      status: input.paymentMethod === "online" ? "pending" : "cash_due",
      amount: pricing.total,
      currency: "AED",
      checkoutReference: createReference(
        input.paymentMethod === "online" ? "PAY" : "CASH",
      ),
      providerSessionId: null,
      providerPaymentId: null,
      receiptUrl: null,
      failureReason: null,
      metadata: {
        serviceTitle: service.title,
        serviceSlug: service.slug,
        lineItems: pricing.lineItems,
      },
      paidAt: null,
    });

    const savedPayment = await paymentRepository().save(payment);

    await createStatusHistoryEntry({
      bookingId: savedBooking.id,
      changedByUserId: user.id,
      fromStatus: null,
      toStatus: "pending",
      note: "Order created from customer frontend.",
    });

    if (input.saveAddress?.label?.trim()) {
      const savedAddressInput: SavedAddressInput = {
        label: input.saveAddress.label.trim(),
        location: input.address.location,
        building: input.address.building,
        apartment: input.address.apartment,
        city: input.address.city,
        mapLink: input.address.mapLink,
        lat: input.address.lat,
        lng: input.address.lng,
        isDefault: input.saveAddress.isDefault,
      };

      await accountService.createSavedAddress(user.id, savedAddressInput);
    }

    return {
      message:
        input.paymentMethod === "online"
          ? "Booking created. Continue to the online payment page."
          : "Booking created successfully. You can track it from your account.",
      payment: savedPayment,
    };
  },

  async getUserBookingHistory(userId: string) {
    return bookingRepository()
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.payments", "payment")
      .leftJoinAndSelect("booking.statusHistory", "statusHistory")
      .leftJoinAndSelect("booking.assignedStaff", "assignedStaff")
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
      .leftJoinAndSelect("booking.assignedStaff", "assignedStaff")
      .leftJoinAndSelect("booking.payments", "payment")
      .leftJoinAndSelect("booking.statusHistory", "statusHistory")
      .orderBy("booking.createdAt", "DESC")
      .addOrderBy("statusHistory.createdAt", "DESC")
      .addOrderBy("payment.createdAt", "DESC")
      .getMany();
  },

  async getAdminDashboard() {
    const [bookings, staffMembers] = await Promise.all([
      this.listAdminBookings(),
      staffService.listStaffMembers(),
    ]);
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
      pendingCustomerRequests: bookings.filter(
        (booking) => booking.customerRequest?.status === "pending",
      ).length,
      revenueCollected: bookings
        .filter((booking) => booking.paymentStatus === "paid")
        .reduce((total, booking) => total + booking.totalAmount, 0),
    };

    return {
      summary,
      bookings,
      staffMembers,
    };
  },

  async assignStaffToBooking(
    bookingId: string,
    staffId: string | null,
    changedByUserId: string,
  ) {
    const booking = await bookingRepository().findOne({
      where: { id: bookingId },
      relations: {
        assignedStaff: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    const previousAssignee = booking.assignedStaff?.fullName || null;
    let nextAssignee: StaffMember | null = null;

    if (staffId) {
      nextAssignee = await staffRepository().findOne({
        where: { id: staffId },
      });

      if (!nextAssignee) {
        throw new Error("Staff member not found.");
      }

      if (!nextAssignee.isActive) {
        throw new Error("Selected staff member is inactive.");
      }

      if (!isStaffAvailableForDate(nextAssignee, booking.schedule.date)) {
        throw new HttpError(
          409,
          "Selected staff member is not available on the booking day.",
        );
      }

      await assertStaffHasNoSlotConflict({
        staffId: nextAssignee.id,
        schedule: booking.schedule,
        excludeBookingId: booking.id,
      });
    }

    booking.assignedStaffId = nextAssignee?.id ?? null;
    booking.assignedStaff = nextAssignee;
    booking.assignedAt = nextAssignee ? new Date().toISOString() : null;
    await bookingRepository().save(booking);

    const assignmentNote = nextAssignee
      ? previousAssignee && previousAssignee !== nextAssignee.fullName
        ? `Admin reassigned staff from ${previousAssignee} to ${nextAssignee.fullName}.`
        : `Admin assigned staff ${nextAssignee.fullName}.`
      : previousAssignee
        ? `Admin removed staff assignment (${previousAssignee}).`
        : "Admin cleared the staff assignment.";

    await createStatusHistoryEntry({
      bookingId: booking.id,
      changedByUserId,
      fromStatus: booking.status,
      toStatus: booking.status,
      note: assignmentNote,
    });

    return booking;
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

    await createStatusHistoryEntry({
      bookingId: booking.id,
      changedByUserId,
      fromStatus: previousStatus,
      toStatus,
      note: note?.trim() || null,
    });

    return booking;
  },

  async requestCustomerCancel(
    bookingId: string,
    userId: string,
    note?: string,
  ) {
    const booking = await getOwnedBooking(bookingId, userId);

    if (!canCustomerManageBooking(booking)) {
      throw new Error("This order can no longer be changed.");
    }

    if (booking.customerRequest?.status === "pending") {
      throw new Error("This order already has a pending request.");
    }

    booking.customerRequest = {
      type: "cancel",
      status: "pending",
      note: note?.trim() || null,
      requestedSchedule: null,
      createdAt: new Date().toISOString(),
      respondedAt: null,
      respondedByUserId: null,
      adminNote: null,
    };

    await bookingRepository().save(booking);
    await createStatusHistoryEntry({
      bookingId: booking.id,
      changedByUserId: userId,
      fromStatus: booking.status,
      toStatus: booking.status,
      note: toCustomerRequestNote("cancel", note),
    });

    return booking;
  },

  async requestCustomerReschedule(
    bookingId: string,
    userId: string,
    input: {
      schedule: BookingSchedule;
      note?: string;
    },
  ) {
    const booking = await getOwnedBooking(bookingId, userId);

    if (!canCustomerManageBooking(booking)) {
      throw new Error("This order can no longer be changed.");
    }

    if (booking.customerRequest?.status === "pending") {
      throw new Error("This order already has a pending request.");
    }

    await assertUserSlotRules({
      userId,
      serviceId: booking.serviceId,
      address: booking.address,
      schedule: input.schedule,
      excludeBookingId: booking.id,
    });

    booking.customerRequest = {
      type: "reschedule",
      status: "pending",
      note: input.note?.trim() || null,
      requestedSchedule: input.schedule,
      createdAt: new Date().toISOString(),
      respondedAt: null,
      respondedByUserId: null,
      adminNote: null,
    };

    await bookingRepository().save(booking);
    await createStatusHistoryEntry({
      bookingId: booking.id,
      changedByUserId: userId,
      fromStatus: booking.status,
      toStatus: booking.status,
      note: toCustomerRequestNote("reschedule", input.note, input.schedule),
    });

    return booking;
  },

  async resolveCustomerRequest(
    bookingId: string,
    changedByUserId: string,
    input: {
      decision: BookingChangeRequestStatus;
      note?: string;
    },
  ) {
    const booking = await bookingRepository().findOne({
      where: { id: bookingId },
      relations: {
        assignedStaff: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (!booking.customerRequest || booking.customerRequest.status !== "pending") {
      throw new Error("No pending customer request found for this booking.");
    }

    const request = booking.customerRequest;
    const previousStatus = booking.status;
    let historyNote = "";
    let assignmentNote = "";

    if (input.decision === "approved") {
      if (request.type === "cancel") {
        booking.status = "cancelled";
        historyNote =
          input.note?.trim() ||
          "Admin approved the customer's cancellation request.";
      } else {
        if (request.requestedSchedule) {
          await assertUserSlotRules({
            userId: booking.userId || changedByUserId,
            serviceId: booking.serviceId,
            address: booking.address,
            schedule: request.requestedSchedule,
            excludeBookingId: booking.id,
          });

          if (booking.assignedStaffId && booking.assignedStaff) {
            const assignedStaffStillAvailable = isStaffAvailableForDate(
              booking.assignedStaff,
              request.requestedSchedule.date,
            );

            if (assignedStaffStillAvailable) {
              const conflictingBooking = await findStaffSlotConflict({
                staffId: booking.assignedStaff.id,
                schedule: request.requestedSchedule,
                excludeBookingId: booking.id,
              });

              if (conflictingBooking) {
                booking.assignedStaffId = null;
                booking.assignedStaff = null;
                booking.assignedAt = null;
                assignmentNote =
                  " Staff assignment was cleared because the assigned team member already has another booking in the requested time slot.";
              }
            } else {
              booking.assignedStaffId = null;
              booking.assignedStaff = null;
              booking.assignedAt = null;
              assignmentNote =
                " Staff assignment was cleared because the assigned team member is not available on the requested date.";
            }
          }

          booking.schedule = request.requestedSchedule;
        }
        historyNote =
          input.note?.trim()
            ? `${input.note.trim()}${assignmentNote}`
            : `Admin approved the customer's reschedule request.${assignmentNote}`;
      }
    } else {
      historyNote =
        input.note?.trim() ||
        `Admin declined the customer's ${request.type} request.`;
    }

    booking.customerRequest = {
      ...request,
      status: input.decision,
      respondedAt: new Date().toISOString(),
      respondedByUserId: changedByUserId,
      adminNote: input.note?.trim() || null,
    };

    await bookingRepository().save(booking);
    await createStatusHistoryEntry({
      bookingId: booking.id,
      changedByUserId,
      fromStatus: previousStatus,
      toStatus: booking.status,
      note: historyNote,
    });

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
