"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, STAFF_ROLES } from "@/lib/session";
import { logActivity } from "@/lib/activity";
import { paymentSchema } from "@/lib/validations";
import { friendlyError, type ActionResult } from "@/lib/errors";
import { fd, fdOptional } from "@/lib/utils";

function parseForm(formData: FormData) {
  return {
    type: fd(formData, "type") as "CUSTOMER_RECEIPT" | "DEALER_PAYMENT" | "INVESTOR_SETTLEMENT",
    amount: fd(formData, "amount"),
    date: fd(formData, "date"),
    mode: (fdOptional(formData, "mode") as
      | "CASH"
      | "BANK_TRANSFER"
      | "UPI"
      | "CHEQUE"
      | "CARD"
      | "OTHER") || "BANK_TRANSFER",
    reference: fdOptional(formData, "reference"),
    notes: fdOptional(formData, "notes"),
    customerId: fdOptional(formData, "customerId") || null,
    dealerId: fdOptional(formData, "dealerId") || null,
    investorId: fdOptional(formData, "investorId") || null,
    tripSheetId: fdOptional(formData, "tripSheetId") || null,
  };
}

export async function recordPayment(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireUser(STAFF_ROLES);
    const parsed = paymentSchema.safeParse(parseForm(formData));
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const data = parsed.data;

    const payment = await prisma.payment.create({
      data: {
        type: data.type,
        amount: data.amount,
        date: new Date(data.date),
        mode: data.mode,
        reference: data.reference,
        notes: data.notes,
        customerId: data.customerId,
        dealerId: data.dealerId,
        investorId: data.investorId,
        tripSheetId: data.tripSheetId,
      },
    });

    await logActivity({
      userId: user.id,
      action: "CREATE",
      entityType: "Payment",
      entityId: payment.id,
      description: `Recorded ${data.type.replaceAll("_", " ").toLowerCase()} of ₹${data.amount}`,
    });

    if (data.customerId) revalidatePath(`/customers/${data.customerId}`);
    if (data.dealerId) revalidatePath(`/dealers/${data.dealerId}`);
    if (data.investorId) revalidatePath(`/investors/${data.investorId}`);
    revalidatePath("/reports");
    return { success: true, id: payment.id };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}

export async function deletePayment(id: string, redirectPath: string): Promise<ActionResult> {
  try {
    await requireUser(STAFF_ROLES);
    await prisma.payment.delete({ where: { id } });
    revalidatePath(redirectPath);
    return { success: true };
  } catch (err) {
    return { success: false, error: friendlyError(err) };
  }
}
