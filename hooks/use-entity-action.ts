"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/errors";

/** Wires a Server Action (that returns ActionResult) up to a <form>, with
 *  toast feedback and an on-success callback (e.g. redirect back to the list). */
export function useEntityAction(
  action: (formData: FormData) => Promise<ActionResult>,
  opts: { onSuccess?: (id?: string) => void; successMessage: string }
) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => action(formData),
    { success: false, error: "" }
  );

  useEffect(() => {
    if (state.success) {
      toast.success(opts.successMessage);
      opts.onSuccess?.(state.id);
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return { formAction, pending, error: !state.success ? state.error : undefined };
}
