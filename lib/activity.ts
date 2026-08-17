import "server-only";
import { prisma } from "@/lib/prisma";

export async function logActivity(params: {
  userId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId?: string | null;
  description: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        description: params.description,
      },
    });
  } catch {
    // Activity logging must never block the primary operation.
  }
}
