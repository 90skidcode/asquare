import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function TripSheetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.tripSheet.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      dealer: true,
      investor: true,
      attachments: true,
      payments: true,
    },
  });
  if (!trip) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/trip-sheets" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          <ArrowLeft className="size-4" /> Back to Trip Sheets
        </Link>
      </div>

      <PageHeader
        title={trip.tripNumber}
        description={formatDate(trip.tripDate)}
        actions={
          <Button asChild variant="outline">
            <Link href={`/trip-sheets/${trip.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Section title="Customer &amp; Vehicle">
              <Row label="Customer">{trip.customer.name}</Row>
              <Row label="Vehicle">{trip.vehicle.plateNumber}</Row>
              <Row label="Driver">{trip.driverName}</Row>
              {trip.driverPhone && <Row label="Driver Phone">{trip.driverPhone}</Row>}
            </Section>

            <Section title="Route">
              <Row label="From">{trip.pickupLocation}</Row>
              <Row label="To">{trip.dropLocation}</Row>
              <Row label="Type">{trip.tripType}</Row>
            </Section>

            <Section title="Timing">
              <Row label="Start">{formatDateTime(trip.startDateTime)}</Row>
              {trip.endDateTime && <Row label="End">{formatDateTime(trip.endDateTime)}</Row>}
            </Section>

            <Section title="Kilometer Calculation">
              <Row label="Opening KM">{trip.openingKm.toFixed(1)}</Row>
              <Row label="Closing KM">{trip.closingKm.toFixed(1)}</Row>
              <Row label="Total Running KM">{trip.totalKm.toFixed(1)}</Row>
              <Row label="Package/Included KM">{trip.includedKm.toFixed(1)}</Row>
              <Row label="Extra KM">{trip.extraKm.toFixed(1)}</Row>
              <Row label="Extra KM Rate">₹{trip.extraKmRate.toFixed(2)}/km</Row>
              <Row label="Extra KM Amount" emphasize>{formatCurrency(trip.extraKmAmount)}</Row>
            </Section>

            <Section title="Expenses">
              <Row label="Waiting Charges">{formatCurrency(trip.waitingCharges)}</Row>
              <Row label="Toll Charges">{formatCurrency(trip.tollCharges)}</Row>
              <Row label="Parking Charges">{formatCurrency(trip.parkingCharges)}</Row>
              <Row label="Driver Bata">{formatCurrency(trip.driverBata)}</Row>
              <Row label="Permit Charges">{formatCurrency(trip.permitCharges)}</Row>
              <Row label="Fuel Charges">{formatCurrency(trip.fuelCharges)}</Row>
              <Row label="Other Expenses">{formatCurrency(trip.otherExpenses)}</Row>
              <Row label="Total Expenses" emphasize>{formatCurrency(trip.totalExpenses)}</Row>
            </Section>

            <Section title="Financials">
              <Row label="Customer Charges">{formatCurrency(trip.customerCharges)}</Row>
              {trip.dealerId && <Row label="Dealer Charges">{formatCurrency(trip.dealerCharges)}</Row>}
              {trip.investorId && <Row label="Investor Settlement">{formatCurrency(trip.investorSettlement)}</Row>}
              <Row label="Net Revenue" emphasize className="text-lg font-semibold">
                {formatCurrency(trip.netRevenue)}
              </Row>
            </Section>

            {trip.remarks && (
              <Section title="Remarks">
                <p className="text-zinc-700 dark:text-zinc-300">{trip.remarks}</p>
              </Section>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-zinc-400">Trip Status</p>
                <Badge className={TRIP_STATUS_COLORS[trip.tripStatus]}>
                  {TRIP_STATUS_LABELS[trip.tripStatus]}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Payment Status</p>
                <Badge className={PAYMENT_STATUS_COLORS[trip.paymentStatus]}>
                  {PAYMENT_STATUS_LABELS[trip.paymentStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {trip.dealer && (
            <Card>
              <CardHeader>
                <CardTitle>Dealer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{trip.dealer.name}</p>
                <p className="text-sm text-zinc-400">{trip.dealer.code}</p>
              </CardContent>
            </Card>
          )}

          {trip.investor && (
            <Card>
              <CardHeader>
                <CardTitle>Investor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{trip.investor.name}</p>
                <p className="text-sm text-zinc-400">{trip.investor.code}</p>
              </CardContent>
            </Card>
          )}

          {trip.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trip.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {a.fileName}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {trip.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {trip.payments.map((p) => (
                    <div key={p.id} className="flex justify-between">
                      <span>{formatDate(p.date)}</span>
                      <span className="font-medium">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
  emphasize,
  className,
}: {
  label: string;
  children: React.ReactNode;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-between ${className || ""}`}>
      <span className={emphasize ? "font-medium" : "text-zinc-600 dark:text-zinc-400"}>{label}</span>
      <span className={emphasize ? "font-semibold text-indigo-600 dark:text-indigo-400" : "font-medium text-zinc-900 dark:text-zinc-100"}>
        {children}
      </span>
    </div>
  );
}
