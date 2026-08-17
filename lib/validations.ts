import { z } from "zod";

export const vehicleSchema = z.object({
  plateNumber: z.string().min(2, "Plate number is required").toUpperCase(),
  model: z.string().min(1, "Model is required"),
  type: z.string().optional(),
  capacity: z.coerce.number().int().nonnegative().optional().nullable(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]).default("ACTIVE"),
  investorId: z.string().optional().nullable(),
  dealerId: z.string().optional().nullable(),
  notes: z.string().optional(),
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const investorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankIfsc: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});
export type InvestorInput = z.infer<typeof investorSchema>;

export const dealerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  commissionRate: z.coerce.number().min(0).max(100).default(0),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});
export type DealerInput = z.infer<typeof dealerSchema>;

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  billingAddress: z.string().optional(),
  gstNumber: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const tripSheetSchema = z.object({
  tripDate: z.string().min(1, "Trip date is required"),
  customerId: z.string().min(1, "Customer is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  dealerId: z.string().optional().nullable(),
  investorId: z.string().optional().nullable(),

  driverName: z.string().min(1, "Driver name is required"),
  driverPhone: z.string().optional(),
  driverLicenseNo: z.string().optional(),

  pickupLocation: z.string().min(1, "Pickup location is required"),
  dropLocation: z.string().min(1, "Drop location is required"),
  tripType: z.enum(["LOCAL", "OUTSTATION", "AIRPORT", "RENTAL", "ONE_WAY", "ROUND_TRIP"]),
  startDateTime: z.string().min(1, "Start date & time is required"),
  endDateTime: z.string().optional(),

  openingKm: z.coerce.number().min(0).default(0),
  closingKm: z.coerce.number().min(0).default(0),
  includedKm: z.coerce.number().min(0).default(0),
  extraKmRate: z.coerce.number().min(0).default(0),

  waitingCharges: z.coerce.number().min(0).default(0),
  tollCharges: z.coerce.number().min(0).default(0),
  parkingCharges: z.coerce.number().min(0).default(0),
  driverBata: z.coerce.number().min(0).default(0),
  permitCharges: z.coerce.number().min(0).default(0),
  fuelCharges: z.coerce.number().min(0).default(0),
  otherExpenses: z.coerce.number().min(0).default(0),

  customerCharges: z.coerce.number().min(0).default(0),
  dealerCharges: z.coerce.number().min(0).default(0),
  investorSettlement: z.coerce.number().min(0).default(0),

  tripStatus: z.enum(["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"]).default("SCHEDULED"),
  paymentStatus: z.enum(["PENDING", "PARTIAL", "PAID"]).default("PENDING"),
  remarks: z.string().optional(),
});
export type TripSheetInput = z.infer<typeof tripSheetSchema>;

export const paymentSchema = z.object({
  type: z.enum(["CUSTOMER_RECEIPT", "DEALER_PAYMENT", "INVESTOR_SETTLEMENT"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  mode: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CHEQUE", "CARD", "OTHER"]).default("BANK_TRANSFER"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().optional().nullable(),
  dealerId: z.string().optional().nullable(),
  investorId: z.string().optional().nullable(),
  tripSheetId: z.string().optional().nullable(),
});
export type PaymentInput = z.infer<typeof paymentSchema>;

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "STAFF", "DEALER", "INVESTOR"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.coerce.boolean().default(true),
  dealerId: z.string().optional().nullable(),
  investorId: z.string().optional().nullable(),
});
export type UserInput = z.infer<typeof userSchema>;
