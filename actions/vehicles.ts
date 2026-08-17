"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, STAFF_ROLES } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { vehicleSchema } from "@/lib/validations";
import { friendlyError, type ActionResult } from "@/lib/errors";
import { fd, fdOptional } from "@/lib/utils";

function parseForm(formData: FormData) {
  return {
    plateNumber: fd(formData, "plateNumber"),
    model: fd(formData, "model"),
    type: fdOptional(formData, "type"),
    capacity: fdOptional(formData, "capacity"),
    status: (fdOptional(formData, "status") as "ACTIVE" | "MAINTENANCE" | "INACTIVE") || "ACTIVE",
    investorId: fdOptional(formData, "investorId") || null,
    dealerId: fdOptional(formData, "dealerId") || null,
    notes: fdOptional(formData, "notes"),
  };
}

export async function createVehicle(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = vehicleSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const vehicle = await prisma.vehicle.create({
      data: {
        ...parsed.data,
        capacity: parsed.data.capacity ?? null,
        investorId: parsed.data.investorId || null,
        dealerId: parsed.data.dealerId || null,
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "Vehicle",
      entityId: vehicle.id,
      description: `Added vehicle ${vehicle.plateNumber}`,
    });

    revalidatePath("/vehicles");
    return { success: true, id: vehicle.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function updateVehicle(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = vehicleSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...parsed.data,
        capacity: parsed.data.capacity ?? null,
        investorId: parsed.data.investorId || null,
        dealerId: parsed.data.dealerId || null,
      },
    });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "Vehicle",
      entityId: vehicle.id,
      description: `Updated vehicle ${vehicle.plateNumber}`,
    });

    revalidatePath("/vehicles");
    revalidatePath(`/vehicles/${id}`);
    return { success: true, id: vehicle.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function deleteVehicle(id: string): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const vehicle = await prisma.vehicle.delete({ where: { id } });

    await logActivity({
      userId: user.id,
      action: "DELETE",
      entityType: "Vehicle",
      entityId: id,
      description: `Deleted vehicle ${vehicle.plateNumber}`,
    });

    revalidatePath("/vehicles");
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export { friendlyError };
