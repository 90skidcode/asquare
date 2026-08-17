"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/forms/field";
import { createTripSheet, updateTripSheet } from "@/actions/trip-sheets";
import { useEntityAction } from "@/hooks/use-entity-action";
import { calculateTrip, type TripCalcInput } from "@/lib/trip-calculations";
import { formatCurrency, toNumber } from "@/lib/utils";
import { TRIP_TYPE_LABELS, TRIP_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { TripSheet } from "@/app/generated/prisma";

type Option = { id: string; label: string };

function toInputDateTime(d: Date | string | null | undefined) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toInputDate(d: Date | string | null | undefined) {
  if (!d) return new Date().toISOString().slice(0, 10);
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function TripSheetForm({
  trip,
  customers,
  vehicles,
  dealers,
  investors,
}: {
  trip?: TripSheet;
  customers: Option[];
  vehicles: Option[];
  dealers: Option[];
  investors: Option[];
}) {
  const router = useRouter();
  const action = trip ? updateTripSheet.bind(null, trip.id) : createTripSheet;
  const { formAction, pending, error } = useEntityAction(action, {
    successMessage: trip ? "Trip sheet updated" : "Trip sheet created",
    onSuccess: (id) => router.push(trip ? `/trip-sheets/${trip.id}` : `/trip-sheets/${id}`),
  });

  const [calc, setCalc] = useState<TripCalcInput>({
    openingKm: toNumber(trip?.openingKm),
    closingKm: toNumber(trip?.closingKm),
    includedKm: toNumber(trip?.includedKm),
    extraKmRate: toNumber(trip?.extraKmRate),
    waitingCharges: toNumber(trip?.waitingCharges),
    tollCharges: toNumber(trip?.tollCharges),
    parkingCharges: toNumber(trip?.parkingCharges),
    driverBata: toNumber(trip?.driverBata),
    permitCharges: toNumber(trip?.permitCharges),
    fuelCharges: toNumber(trip?.fuelCharges),
    otherExpenses: toNumber(trip?.otherExpenses),
    customerCharges: toNumber(trip?.customerCharges),
  });

  const result = useMemo(() => calculateTrip(calc), [calc]);

  function num(key: keyof TripCalcInput) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number.parseFloat(e.target.value);
      setCalc((prev) => ({ ...prev, [key]: Number.isFinite(v) ? v : 0 }));
    };
  }

  return (
    <form action={formAction} className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Trip Date" htmlFor="tripDate">
            <Input id="tripDate" name="tripDate" type="date" defaultValue={toInputDate(trip?.tripDate)} required />
          </Field>
          <Field label="Customer" htmlFor="customerId">
            <Select id="customerId" name="customerId" defaultValue={trip?.customerId ?? ""} required>
              <option value="" disabled>
                Select customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Vehicle" htmlFor="vehicleId">
            <Select id="vehicleId" name="vehicleId" defaultValue={trip?.vehicleId ?? ""} required>
              <option value="" disabled>
                Select vehicle
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Dealer (optional)" htmlFor="dealerId">
            <Select id="dealerId" name="dealerId" defaultValue={trip?.dealerId ?? ""}>
              <option value="">— None —</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Investor Mapping" htmlFor="investorId">
            <Select id="investorId" name="investorId" defaultValue={trip?.investorId ?? ""}>
              <option value="">— None —</option>
              {investors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Trip Type" htmlFor="tripType">
            <Select id="tripType" name="tripType" defaultValue={trip?.tripType ?? "LOCAL"}>
              {Object.entries(TRIP_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Driver Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Driver Name" htmlFor="driverName">
            <Input id="driverName" name="driverName" defaultValue={trip?.driverName} required />
          </Field>
          <Field label="Driver Phone" htmlFor="driverPhone">
            <Input id="driverPhone" name="driverPhone" defaultValue={trip?.driverPhone ?? ""} />
          </Field>
          <Field label="License No." htmlFor="driverLicenseNo">
            <Input id="driverLicenseNo" name="driverLicenseNo" defaultValue={trip?.driverLicenseNo ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route &amp; Timing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pickup Location" htmlFor="pickupLocation">
            <Input id="pickupLocation" name="pickupLocation" defaultValue={trip?.pickupLocation} required />
          </Field>
          <Field label="Drop Location" htmlFor="dropLocation">
            <Input id="dropLocation" name="dropLocation" defaultValue={trip?.dropLocation} required />
          </Field>
          <Field label="Start Date &amp; Time" htmlFor="startDateTime">
            <Input
              id="startDateTime"
              name="startDateTime"
              type="datetime-local"
              defaultValue={toInputDateTime(trip?.startDateTime)}
              required
            />
          </Field>
          <Field label="End Date &amp; Time" htmlFor="endDateTime">
            <Input
              id="endDateTime"
              name="endDateTime"
              type="datetime-local"
              defaultValue={toInputDateTime(trip?.endDateTime)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meter &amp; KM Calculation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Opening KM" htmlFor="openingKm">
            <Input
              id="openingKm"
              name="openingKm"
              type="number"
              step="0.1"
              defaultValue={calc.openingKm}
              onChange={num("openingKm")}
            />
          </Field>
          <Field label="Closing KM" htmlFor="closingKm">
            <Input
              id="closingKm"
              name="closingKm"
              type="number"
              step="0.1"
              defaultValue={calc.closingKm}
              onChange={num("closingKm")}
            />
          </Field>
          <Field label="Included / Package KM" htmlFor="includedKm">
            <Input
              id="includedKm"
              name="includedKm"
              type="number"
              step="0.1"
              defaultValue={calc.includedKm}
              onChange={num("includedKm")}
            />
          </Field>
          <Field label="Extra KM Rate (₹/km)" htmlFor="extraKmRate">
            <Input
              id="extraKmRate"
              name="extraKmRate"
              type="number"
              step="0.1"
              defaultValue={calc.extraKmRate}
              onChange={num("extraKmRate")}
            />
          </Field>

          <div className="col-span-full grid grid-cols-3 gap-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3 text-sm">
            <Stat label="Total Running KM" value={result.totalKm.toFixed(1)} />
            <Stat label="Extra KM" value={result.extraKm.toFixed(1)} />
            <Stat label="Extra KM Amount" value={formatCurrency(result.extraKmAmount)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Waiting Charges" htmlFor="waitingCharges">
            <Input
              id="waitingCharges"
              name="waitingCharges"
              type="number"
              step="0.01"
              defaultValue={calc.waitingCharges}
              onChange={num("waitingCharges")}
            />
          </Field>
          <Field label="Toll Charges" htmlFor="tollCharges">
            <Input
              id="tollCharges"
              name="tollCharges"
              type="number"
              step="0.01"
              defaultValue={calc.tollCharges}
              onChange={num("tollCharges")}
            />
          </Field>
          <Field label="Parking Charges" htmlFor="parkingCharges">
            <Input
              id="parkingCharges"
              name="parkingCharges"
              type="number"
              step="0.01"
              defaultValue={calc.parkingCharges}
              onChange={num("parkingCharges")}
            />
          </Field>
          <Field label="Driver Bata" htmlFor="driverBata">
            <Input
              id="driverBata"
              name="driverBata"
              type="number"
              step="0.01"
              defaultValue={calc.driverBata}
              onChange={num("driverBata")}
            />
          </Field>
          <Field label="Permit Charges" htmlFor="permitCharges">
            <Input
              id="permitCharges"
              name="permitCharges"
              type="number"
              step="0.01"
              defaultValue={calc.permitCharges}
              onChange={num("permitCharges")}
            />
          </Field>
          <Field label="Fuel Charges (optional)" htmlFor="fuelCharges">
            <Input
              id="fuelCharges"
              name="fuelCharges"
              type="number"
              step="0.01"
              defaultValue={calc.fuelCharges}
              onChange={num("fuelCharges")}
            />
          </Field>
          <Field label="Other Expenses" htmlFor="otherExpenses">
            <Input
              id="otherExpenses"
              name="otherExpenses"
              type="number"
              step="0.01"
              defaultValue={calc.otherExpenses}
              onChange={num("otherExpenses")}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financials &amp; Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Customer Charges" htmlFor="customerCharges">
            <Input
              id="customerCharges"
              name="customerCharges"
              type="number"
              step="0.01"
              defaultValue={calc.customerCharges}
              onChange={num("customerCharges")}
            />
          </Field>
          <Field label="Dealer Charges" htmlFor="dealerCharges">
            <Input id="dealerCharges" name="dealerCharges" type="number" step="0.01" defaultValue={toNumber(trip?.dealerCharges)} />
          </Field>
          <Field label="Investor Settlement" htmlFor="investorSettlement">
            <Input
              id="investorSettlement"
              name="investorSettlement"
              type="number"
              step="0.01"
              defaultValue={toNumber(trip?.investorSettlement)}
            />
          </Field>
          <Field label="Trip Status" htmlFor="tripStatus">
            <Select id="tripStatus" name="tripStatus" defaultValue={trip?.tripStatus ?? "SCHEDULED"}>
              {Object.entries(TRIP_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Payment Status" htmlFor="paymentStatus">
            <Select id="paymentStatus" name="paymentStatus" defaultValue={trip?.paymentStatus ?? "PENDING"}>
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="col-span-full grid grid-cols-2 gap-4 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 p-3 text-sm">
            <Stat label="Total Expenses" value={formatCurrency(result.totalExpenses)} />
            <Stat label="Net Revenue" value={formatCurrency(result.netRevenue)} emphasize />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea id="remarks" name="remarks" rows={3} defaultValue={trip?.remarks ?? ""} />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {trip ? "Save changes" : "Create trip sheet"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Stat({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p
        className={
          emphasize
            ? "text-base font-semibold text-indigo-700 dark:text-indigo-400"
            : "text-sm font-medium text-zinc-800 dark:text-zinc-200"
        }
      >
        {value}
      </p>
    </div>
  );
}
