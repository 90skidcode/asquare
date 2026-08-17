"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, STAFF_ROLES } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { investorSchema } from "@/lib/validations";
import { friendlyError, type ActionResult } from "@/lib/errors";
import { fd, fdOptional, nextCode } from "@/lib/utils";

function parseForm(formData: FormData) {
  return {
    name: fd(formData, "name"),
    phone: fd(formData, "phone"),
    email: fdOptional(formData, "email") ?? "",
    address: fdOptional(formData, "address"),
    bankName: fdOptional(formData, "bankName"),
    bankAccount: fdOptional(formData, "bankAccount"),
    bankIfsc: fdOptional(formData, "bankIfsc"),
    isActive: fdOptional(formData, "isActive") !== "false",
    notes: fdOptional(formData, "notes"),
  };
}

export async function createInvestor(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = investorSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const last = await prisma.investor.findFirst({ orderBy: { createdAt: "desc" }, select: { code: true } });
    const code = nextCode("INV", last?.code);

    const investor = await prisma.investor.create({
      data: { ...parsed.data, code, email: parsed.data.email || null },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "Investor",
      entityId: investor.id,
      description: `Added investor ${investor.name} (${investor.code})`,
    });

    revalidatePath("/investors");
    return { success: true, id: investor.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function updateInvestor(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = investorSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const investor = await prisma.investor.update({
      where: { id },
      data: { ...parsed.data, email: parsed.data.email || null },
    });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "Investor",
      entityId: investor.id,
      description: `Updated investor ${investor.name}`,
    });

    revalidatePath("/investors");
    revalidatePath(`/investors/${id}`);
    return { success: true, id: investor.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function toggleInvestorActive(id: string, isActive: boolean): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const investor = await prisma.investor.update({ where: { id }, data: { isActive } });

    await logActivity({
      userId: user.id,
      action: "UPDATE",
      entityType: "Investor",
      entityId: investor.id,
      description: `${isActive ? "Reactivated" : "Deactivated"} investor ${investor.name}`,
    });

    revalidatePath("/investors");
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function addInvestmentRecord(investorId: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const amount = Number.parseFloat(fd(formData, "amount"));
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: "Enter a valid amount." };
    }

    const record = await prisma.investmentRecord.create({
      data: {
        investorId,
        vehicleId: fdOptional(formData, "vehicleId") || null,
        amount,
        date: fdOptional(formData, "date") ? new Date(fd(formData, "date")) : new Date(),
        notes: fdOptional(formData, "notes"),
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "InvestmentRecord",
      entityId: record.id,
      description: `Recorded investment of ${amount} for investor ${investorId}`,
    });

    revalidatePath(`/investors/${investorId}`);
    return { success: true, id: record.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}
