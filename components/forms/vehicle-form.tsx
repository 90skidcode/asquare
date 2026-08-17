"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { createVehicle, updateVehicle } from "@/actions/vehicles";
import { useEntityAction } from "@/hooks/use-entity-action";
import type { Vehicle } from "@/app/generated/prisma";

type Option = { id: string; label: string };

export function VehicleForm({
  vehicle,
  investors,
  dealers,
}: {
  vehicle?: Vehicle;
  investors: Option[];
  dealers: Option[];
}) {
  const router = useRouter();
  const action = vehicle ? updateVehicle.bind(null, vehicle.id) : createVehicle;
  const { formAction, pending, error } = useEntityAction(action, {
    successMessage: vehicle ? "Vehicle updated" : "Vehicle added",
    onSuccess: () => router.push("/vehicles"),
  });

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Plate Number" htmlFor="plateNumber">
          <Input id="plateNumber" name="plateNumber" defaultValue={vehicle?.plateNumber} required />
        </Field>
        <Field label="Model" htmlFor="model">
          <Input id="model" name="model" defaultValue={vehicle?.model} required />
        </Field>
        <Field label="Type" htmlFor="type">
          <Input id="type" name="type" placeholder="Sedan, SUV, Mini Bus…" defaultValue={vehicle?.type ?? ""} />
        </Field>
        <Field label="Seating Capacity" htmlFor="capacity">
          <Input id="capacity" name="capacity" type="number" min={0} defaultValue={vehicle?.capacity ?? ""} />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={vehicle?.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
        <Field label="Investor" htmlFor="investorId">
          <Select id="investorId" name="investorId" defaultValue={vehicle?.investorId ?? ""}>
            <option value="">— Unassigned —</option>
            {investors.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Dealer" htmlFor="dealerId">
          <Select id="dealerId" name="dealerId" defaultValue={vehicle?.dealerId ?? ""}>
            <option value="">— Unassigned —</option>
            {dealers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} defaultValue={vehicle?.notes ?? ""} />
      </Field>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {vehicle ? "Save changes" : "Add vehicle"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
