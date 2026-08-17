"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/forms/field";
import { recordPayment } from "@/actions/payments";
import { useEntityAction } from "@/hooks/use-entity-action";
import { PAYMENT_MODE_LABELS } from "@/lib/constants";

export function PaymentForm({
  type,
  entityField,
  entityId,
  label,
}: {
  type: "CUSTOMER_RECEIPT" | "DEALER_PAYMENT" | "INVESTOR_SETTLEMENT";
  entityField: "customerId" | "dealerId" | "investorId";
  entityId: string;
  label: string;
}) {
  const { formAction, pending, error } = useEntityAction(recordPayment, {
    successMessage: `${label} recorded`,
  });

  return (
    <form action={formAction} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name={entityField} value={entityId} />

      <Field label="Amount" htmlFor="amount" className="col-span-1">
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
      </Field>
      <Field label="Date" htmlFor="date" className="col-span-1">
        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
      </Field>
      <Field label="Mode" htmlFor="mode" className="col-span-1">
        <Select id="mode" name="mode" defaultValue="BANK_TRANSFER">
          {Object.entries(PAYMENT_MODE_LABELS).map(([value, l]) => (
            <option key={value} value={value}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Reference" htmlFor="reference" className="col-span-1">
        <Input id="reference" name="reference" placeholder="UTR / cheque no." />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Record
        </Button>
      </div>
      {error && <p className="col-span-full text-sm text-rose-600 dark:text-rose-400">{error}</p>}
    </form>
  );
}
