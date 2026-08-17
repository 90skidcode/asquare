import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number.parseFloat(value) : value ?? 0;
  return currencyFormatter.format(Number.isFinite(n) ? n : 0);
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return dateFormatter.format(d);
}

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return dateTimeFormatter.format(d);
}

export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "object" && value !== null && "toNumber" in value
    ? (value as { toNumber: () => number }).toNumber()
    : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Generates the next sequential entity code, e.g. prefix "CUS" -> "CUS-0001". */
export function nextCode(prefix: string, lastCode: string | null | undefined) {
  const lastSeq = lastCode ? Number.parseInt(lastCode.split("-").pop() ?? "0", 10) : 0;
  const next = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

/** Generates the next trip number, e.g. "TS-2026-00042". */
export function nextTripNumber(year: number, lastTripNumber: string | null | undefined) {
  let lastSeq = 0;
  if (lastTripNumber) {
    const parts = lastTripNumber.split("-");
    const lastYear = Number.parseInt(parts[1] ?? "0", 10);
    if (lastYear === year) {
      lastSeq = Number.parseInt(parts[2] ?? "0", 10) || 0;
    }
  }
  return `TS-${year}-${String(lastSeq + 1).padStart(5, "0")}`;
}

/** Safely reads a text field from FormData (never a File) as a string. */
export function fd(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Same as `fd`, but returns undefined for empty/missing values. */
export function fdOptional(formData: FormData, key: string): string | undefined {
  const value = fd(formData, key);
  return value === "" ? undefined : value;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
