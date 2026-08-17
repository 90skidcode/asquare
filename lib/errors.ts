export type ActionResult = { success: true; id?: string } | { success: false; error: string };

export function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "UNAUTHENTICATED" || err.message === "FORBIDDEN") {
      return "You don't have permission to do that.";
    }
    const code = (err as { code?: string }).code;
    if (code === "P2003") {
      return "This record can't be removed because it's linked to existing records.";
    }
    if (code === "P2002") {
      return "A record with that value already exists.";
    }
    if (code === "P2025") {
      return "That record no longer exists.";
    }
  }
  return "Something went wrong. Please try again.";
}
