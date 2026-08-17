"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { createDealer, updateDealer } from "@/actions/dealers";
import { useEntityAction } from "@/hooks/use-entity-action";
import type { Dealer } from "@/app/generated/prisma";

export function DealerForm({ dealer }: { dealer?: Dealer }) {
  const router = useRouter();
  const action = dealer ? updateDealer.bind(null, dealer.id) : createDealer;
  const { formAction, pending, error } = useEntityAction(action, {
    successMessage: dealer ? "Dealer updated" : "Dealer added",
    onSuccess: (id) => router.push(dealer ? `/dealers/${dealer.id}` : `/dealers/${id}`),
  });

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Dealer Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={dealer?.name} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={dealer?.phone} required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={dealer?.email ?? ""} />
        </Field>
        <Field label="Commission Rate (%)" htmlFor="commissionRate">
          <Input
            id="commissionRate"
            name="commissionRate"
            type="number"
            step="0.01"
            min={0}
            max={100}
            defaultValue={dealer ? Number(dealer.commissionRate) : 0}
          />
        </Field>
        <Field label="Status" htmlFor="isActive">
          <Select id="isActive" name="isActive" defaultValue={String(dealer?.isActive ?? true)}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </Field>
      </div>

      <Field label="Address" htmlFor="address">
        <Textarea id="address" name="address" rows={2} defaultValue={dealer?.address ?? ""} />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} defaultValue={dealer?.notes ?? ""} />
      </Field>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {dealer ? "Save changes" : "Add dealer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
