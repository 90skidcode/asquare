"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser, ADMIN_ONLY } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { userSchema } from "@/lib/validations";
import { friendlyError, type ActionResult } from "@/lib/errors";
import { fd, fdOptional } from "@/lib/utils";

function parseForm(formData: FormData) {
  return {
    name: fd(formData, "name"),
    email: fd(formData, "email"),
    phone: fdOptional(formData, "phone"),
    role: fd(formData, "role") as "ADMIN" | "STAFF" | "DEALER" | "INVESTOR",
    password: fdOptional(formData, "password"),
    isActive: fdOptional(formData, "isActive") !== "false",
    dealerId: fdOptional(formData, "dealerId") || null,
    investorId: fdOptional(formData, "investorId") || null,
  };
}

export async function createUser(formData: FormData): Promise<ActionResult> {
  try {
    const admin = await requireUser(ADMIN_ONLY);
    const parsed = userSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const data = parsed.data;

    if (!data.password) return { success: false, error: "Password is required for a new user." };

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        role: data.role,
        isActive: data.isActive,
        passwordHash,
        dealerId: data.role === "DEALER" ? data.dealerId : null,
        investorId: data.role === "INVESTOR" ? data.investorId : null,
      },
    });

    await logActivity({
      userId: admin.id,
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      description: `Created user ${user.name} (${user.role})`,
    });

    revalidatePath("/users");
    return { success: true, id: user.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function updateUser(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const admin = await requireUser(ADMIN_ONLY);
    const parsed = userSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const data = parsed.data;

    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        role: data.role,
        isActive: data.isActive,
        dealerId: data.role === "DEALER" ? data.dealerId : null,
        investorId: data.role === "INVESTOR" ? data.investorId : null,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    await logActivity({
      userId: admin.id,
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      description: `Updated user ${user.name}`,
    });

    revalidatePath("/users");
    return { success: true, id: user.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function toggleUserActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const admin = await requireUser(ADMIN_ONLY);
    if (admin.id === id && !isActive) {
      return { success: false, error: "You can't deactivate your own account." };
    }
    const user = await prisma.user.update({ where: { id }, data: { isActive } });

    await logActivity({
      userId: admin.id,
      action: "UPDATE",
      entityType: "User",
      entityId: user.id,
      description: `${isActive ? "Reactivated" : "Deactivated"} user ${user.name}`,
    });

    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}
