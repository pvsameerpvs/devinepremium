const USER_ROLES = ["user", "admin"];

const BOOKING_STATUSES = [
  "pending",
  "accepted",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "rejected",
];

const PAYMENT_METHODS = ["cash", "online"];

const PAYMENT_STATUSES = [
  "cash_due",
  "pending",
  "paid",
  "failed",
  "refunded",
];

module.exports = {
  USER_ROLES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
};
