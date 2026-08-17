import "server-only";
import { auth } from "@/lib/auth";
import type { Role } from "@/app/generated/prisma";

/** Throws if there is no signed-in user, or the user's role isn't allowed. */
export async function requireUser(allowedRoles?: Role[]) {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    throw new Error("FORBIDDEN");
  }
  return session.user;
}

export const STAFF_ROLES: Role[] = ["ADMIN", "STAFF"];
export const ADMIN_ONLY: Role[] = ["ADMIN"];
