import type { Role, TripStatus, PaymentStatus, TripType, VehicleStatus } from "@/app/generated/prisma";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  STAFF: "Staff",
  DEALER: "Dealer",
  INVESTOR: "Investor",
};

export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  LOCAL: "Local",
  OUTSTATION: "Outstation",
  AIRPORT: "Airport",
  RENTAL: "Rental",
  ONE_WAY: "One Way",
  ROUND_TRIP: "Round Trip",
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  SCHEDULED: "Scheduled",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const TRIP_STATUS_COLORS: Record<TripStatus, string> = {
  SCHEDULED: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  ONGOING: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PARTIAL: "Partial",
  PAID: "Paid",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  PARTIAL: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  ACTIVE: "Active",
  MAINTENANCE: "Maintenance",
  INACTIVE: "Inactive",
};

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  MAINTENANCE: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  INACTIVE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400",
};

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  UPI: "UPI",
  CHEQUE: "Cheque",
  CARD: "Card",
  OTHER: "Other",
};
