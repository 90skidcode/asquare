"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { useEntityAction } from "@/hooks/use-entity-action";
import type { Customer } from "@/app/generated/prisma";

export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const action = customer ? updateCustomer.bind(null, customer.id) : createCustomer;
  const { formAction, pending, error } = useEntityAction(action, {
    successMessage: customer ? "Customer updated" : "Customer added",
    onSuccess: (id) => router.push(customer ? `/customers/${customer.id}` : `/customers/${id}`),
  });

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Customer Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={customer?.name} required />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={customer?.phone} required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={customer?.email ?? ""} />
        </Field>
        <Field label="GST Number" htmlFor="gstNumber">
          <Input id="gstNumber" name="gstNumber" defaultValue={customer?.gstNumber ?? ""} />
        </Field>
        <Field label="Status" htmlFor="isActive">
          <Select id="isActive" name="isActive" defaultValue={String(customer?.isActive ?? true)}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </Field>
      </div>

      <Field label="Address" htmlFor="address">
        <Textarea id="address" name="address" rows={2} defaultValue={customer?.address ?? ""} />
      </Field>
      <Field label="Billing Address" htmlFor="billingAddress">
        <Textarea id="billingAddress" name="billingAddress" rows={2} defaultValue={customer?.billingAddress ?? ""} />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} defaultValue={customer?.notes ?? ""} />
      </Field>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {customer ? "Save changes" : "Add customer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
