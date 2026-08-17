"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { createInvestor, updateInvestor } from "@/actions/investors";
import { useEntityAction } from "@/hooks/use-entity-action";
import type { Investor } from "@/app/generated/prisma";

export function InvestorForm({ investor }: { investor?: Investor }) {
  const router = useRouter();
  const action = investor ? updateInvestor.bind(null, investor.id) : createInvestor;
  const { formAction, pending, error } = useEntityAction(action, {
    successMessage: investor ? "Investor updated" : "Investor added",
    onSuccess: (id) => router.push(investor ? `/investors/${investor.id}` : `/investors/${id}`),
  });

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={investor?.name} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={investor?.phone} required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={investor?.email ?? ""} />
        </Field>
        <Field label="Status" htmlFor="isActive">
          <Select id="isActive" name="isActive" defaultValue={String(investor?.isActive ?? true)}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </Field>
        <Field label="Bank Name" htmlFor="bankName">
          <Input id="bankName" name="bankName" defaultValue={investor?.bankName ?? ""} />
        </Field>
        <Field label="Account Number" htmlFor="bankAccount">
          <Input id="bankAccount" name="bankAccount" defaultValue={investor?.bankAccount ?? ""} />
        </Field>
        <Field label="IFSC Code" htmlFor="bankIfsc">
          <Input id="bankIfsc" name="bankIfsc" defaultValue={investor?.bankIfsc ?? ""} />
        </Field>
      </div>

      <Field label="Address" htmlFor="address">
        <Textarea id="address" name="address" rows={2} defaultValue={investor?.address ?? ""} />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} defaultValue={investor?.notes ?? ""} />
      </Field>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {investor ? "Save changes" : "Add investor"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
