"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireUser, STAFF_ROLES } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { tripSheetSchema } from "@/lib/validations";
import { friendlyError, type ActionResult } from "@/lib/errors";
import { fd, fdOptional, nextTripNumber } from "@/lib/utils";
import { calculateTrip } from "@/lib/trip-calculations";

function parseForm(formData: FormData) {
  return {
    tripDate: fd(formData, "tripDate"),
    customerId: fd(formData, "customerId"),
    vehicleId: fd(formData, "vehicleId"),
    dealerId: fdOptional(formData, "dealerId") || null,
    investorId: fdOptional(formData, "investorId") || null,

    driverName: fd(formData, "driverName"),
    driverPhone: fdOptional(formData, "driverPhone"),
    driverLicenseNo: fdOptional(formData, "driverLicenseNo"),

    pickupLocation: fd(formData, "pickupLocation"),
    dropLocation: fd(formData, "dropLocation"),
    tripType: fd(formData, "tripType") as
      | "LOCAL"
      | "OUTSTATION"
      | "AIRPORT"
      | "RENTAL"
      | "ONE_WAY"
      | "ROUND_TRIP",
    startDateTime: fd(formData, "startDateTime"),
    endDateTime: fdOptional(formData, "endDateTime"),

    openingKm: fdOptional(formData, "openingKm") ?? "0",
    closingKm: fdOptional(formData, "closingKm") ?? "0",
    includedKm: fdOptional(formData, "includedKm") ?? "0",
    extraKmRate: fdOptional(formData, "extraKmRate") ?? "0",

    waitingCharges: fdOptional(formData, "waitingCharges") ?? "0",
    tollCharges: fdOptional(formData, "tollCharges") ?? "0",
    parkingCharges: fdOptional(formData, "parkingCharges") ?? "0",
    driverBata: fdOptional(formData, "driverBata") ?? "0",
    permitCharges: fdOptional(formData, "permitCharges") ?? "0",
    fuelCharges: fdOptional(formData, "fuelCharges") ?? "0",
    otherExpenses: fdOptional(formData, "otherExpenses") ?? "0",

    customerCharges: fdOptional(formData, "customerCharges") ?? "0",
    dealerCharges: fdOptional(formData, "dealerCharges") ?? "0",
    investorSettlement: fdOptional(formData, "investorSettlement") ?? "0",

    tripStatus: (fdOptional(formData, "tripStatus") as
      | "SCHEDULED"
      | "ONGOING"
      | "COMPLETED"
      | "CANCELLED") || "SCHEDULED",
    paymentStatus: (fdOptional(formData, "paymentStatus") as "PENDING" | "PARTIAL" | "PAID") || "PENDING",
    remarks: fdOptional(formData, "remarks"),
  };
}

export async function createTripSheet(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = tripSheetSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const data = parsed.data;

    const calc = calculateTrip(data);

    const tripDate = new Date(data.tripDate);
    const year = tripDate.getFullYear();
    const last = await prisma.tripSheet.findFirst({
      where: { tripNumber: { startsWith: `TS-${year}-` } },
      orderBy: { tripNumber: "desc" },
      select: { tripNumber: true },
    });
    const tripNumber = nextTripNumber(year, last?.tripNumber);

    const trip = await prisma.tripSheet.create({
      data: {
        tripNumber,
        tripDate,
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        dealerId: data.dealerId,
        investorId: data.investorId,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        driverLicenseNo: data.driverLicenseNo,
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        tripType: data.tripType,
        startDateTime: new Date(data.startDateTime),
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
        openingKm: data.openingKm,
        closingKm: data.closingKm,
        totalKm: calc.totalKm,
        includedKm: data.includedKm,
        extraKm: calc.extraKm,
        extraKmRate: data.extraKmRate,
        extraKmAmount: calc.extraKmAmount,
        waitingCharges: data.waitingCharges,
        tollCharges: data.tollCharges,
        parkingCharges: data.parkingCharges,
        driverBata: data.driverBata,
        permitCharges: data.permitCharges,
        fuelCharges: data.fuelCharges,
        otherExpenses: data.otherExpenses,
        customerCharges: data.customerCharges,
        dealerCharges: data.dealerCharges,
        investorSettlement: data.investorSettlement,
        totalExpenses: calc.totalExpenses,
        netRevenue: calc.netRevenue,
        tripStatus: data.tripStatus,
        paymentStatus: data.paymentStatus,
        remarks: data.remarks,
        createdById: user.id,
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "TripSheet",
      entityId: trip.id,
      description: `Created trip sheet ${trip.tripNumber}`,
    });

    revalidatePath("/trip-sheets");
    revalidatePath("/dashboard");
    return { success: true, id: trip.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function updateTripSheet(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = tripSheetSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const data = parsed.data;

    const calc = calculateTrip(data);

    const trip = await prisma.tripSheet.update({
      where: { id },
      data: {
        tripDate: new Date(data.tripDate),
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        dealerId: data.dealerId,
        investorId: data.investorId,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        driverLicenseNo: data.driverLicenseNo,
        pickupLocation: data.pickupLocation,
        dropLocation: data.dropLocation,
        tripType: data.tripType,
        startDateTime: new Date(data.startDateTime),
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
        openingKm: data.openingKm,
        closingKm: data.closingKm,
        totalKm: calc.totalKm,
        includedKm: data.includedKm,
        extraKm: calc.extraKm,
        extraKmRate: data.extraKmRate,
        extraKmAmount: calc.extraKmAmount,
        waitingCharges: data.waitingCharges,
        tollCharges: data.tollCharges,
        parkingCharges: data.parkingCharges,
        driverBata: data.driverBata,
        permitCharges: data.permitCharges,
        fuelCharges: data.fuelCharges,
        otherExpenses: data.otherExpenses,
        customerCharges: data.customerCharges,
        dealerCharges: data.dealerCharges,
        investorSettlement: data.investorSettlement,
        totalExpenses: calc.totalExpenses,
        netRevenue: calc.netRevenue,
        tripStatus: data.tripStatus,
        paymentStatus: data.paymentStatus,
        remarks: data.remarks,
      },
    });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "TripSheet",
      entityId: trip.id,
      description: `Updated trip sheet ${trip.tripNumber}`,
    });

    revalidatePath("/trip-sheets");
    revalidatePath(`/trip-sheets/${id}`);
    revalidatePath("/dashboard");
    return { success: true, id: trip.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function deleteTripSheet(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const attachments = await prisma.tripAttachment.findMany({ where: { tripSheetId: id } });
    await Promise.all(attachments.map((a) => del(a.fileUrl).catch(() => undefined)));

    const trip = await prisma.tripSheet.delete({ where: { id } });

    await logActivity({
      userId: user.id,
      action: "DELETE",
      entityType: "TripSheet",
      entityId: id,
      description: `Deleted trip sheet ${trip.tripNumber}`,
    });

    revalidatePath("/trip-sheets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function uploadTripAttachment(tripSheetId: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Choose a file to upload." };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File must be smaller than 10MB." };
    }

    const blob = await put(`trip-sheets/${tripSheetId}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const attachment = await prisma.tripAttachment.create({
      data: {
        tripSheetId,
        fileName: file.name,
        fileUrl: blob.url,
        fileType: file.type,
        fileSize: file.size,
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "TripAttachment",
      entityId: attachment.id,
      description: `Uploaded attachment ${file.name} to trip sheet`,
    });

    revalidatePath(`/trip-sheets/${tripSheetId}`);
    return { success: true, id: attachment.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function deleteTripAttachment(attachmentId: string, tripSheetId: string): Promise<ActionResult> {
  try {
    await requireUser(STAFF_ROLES);
    const attachment = await prisma.tripAttachment.delete({ where: { id: attachmentId } });
    await del(attachment.fileUrl).catch(() => undefined);

    revalidatePath(`/trip-sheets/${tripSheetId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}
