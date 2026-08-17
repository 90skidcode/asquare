"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, STAFF_ROLES } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { dealerSchema } from "@/lib/validations";
import { friendlyError, type ActionResult } from "@/lib/errors";
import { fd, fdOptional, nextCode } from "@/lib/utils";

function parseForm(formData: FormData) {
  return {
    name: fd(formData, "name"),
    phone: fd(formData, "phone"),
    email: fdOptional(formData, "email") ?? "",
    address: fdOptional(formData, "address"),
    commissionRate: fdOptional(formData, "commissionRate") ?? "0",
    isActive: fdOptional(formData, "isActive") !== "false",
    notes: fdOptional(formData, "notes"),
  };
}

export async function createDealer(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = dealerSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const last = await prisma.dealer.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
    const code = nextCode("DLR", last?.code);

    const dealer = await prisma.dealer.create({
      data: { ...parsed.data, code, email: parsed.data.email || null },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "Dealer",
      entityId: dealer.id,
      description: `Added dealer ${dealer.name} (${dealer.code})`,
    });

    revalidatePath("/dealers");
    return { success: true, id: dealer.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function updateDealer(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = dealerSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const dealer = await prisma.dealer.update({
      where: { id },
      data: { ...parsed.data, email: parsed.data.email || null },
    });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "Dealer",
      entityId: dealer.id,
      description: `Updated dealer ${dealer.name}`,
    });

    revalidatePath("/dealers");
    revalidatePath(`/dealers/${id}`);
    return { success: true, id: dealer.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function toggleDealerActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const dealer = await prisma.dealer.update({ where: { id }, data: { isActive } });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "Dealer",
      entityId: dealer.id,
      description: `${isActive ? "Reactivated" : "Deactivated"} dealer ${dealer.name}`,
    });

    revalidatePath("/dealers");
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}
