"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, STAFF_ROLES } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { customerSchema } from "@/lib/validations";
import { friendlyError, type ActionResult } from "@/lib/errors";
import { fd, fdOptional, nextCode } from "@/lib/utils";

function parseForm(formData: FormData) {
  return {
    name: fd(formData, "name"),
    phone: fd(formData, "phone"),
    email: fdOptional(formData, "email") ?? "",
    address: fdOptional(formData, "address"),
    billingAddress: fdOptional(formData, "billingAddress"),
    gstNumber: fdOptional(formData, "gstNumber"),
    isActive: fdOptional(formData, "isActive") !== "false",
    notes: fdOptional(formData, "notes"),
  };
}

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = customerSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const last = await prisma.customer.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
    const code = nextCode("CUS", last?.code);

    const customer = await prisma.customer.create({
      data: { ...parsed.data, code, email: parsed.data.email || null },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "Customer",
      entityId: customer.id,
      description: `Added customer ${customer.name} (${customer.code})`,
    });

    revalidatePath("/customers");
    return { success: true, id: customer.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function updateCustomer(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = customerSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const customer = await prisma.customer.update({
      where: { id },
      data: { ...parsed.data, email: parsed.data.email || null },
    });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "Customer",
      entityId: customer.id,
      description: `Updated customer ${customer.name}`,
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true, id: customer.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function toggleCustomerActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const customer = await prisma.customer.update({ where: { id }, data: { isActive } });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "Customer",
      entityId: customer.id,
      description: `${isActive ? "Reactivated" : "Deactivated"} customer ${customer.name}`,
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}
