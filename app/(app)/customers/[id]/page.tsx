import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, ClipboardList, Receipt, Wallet, TrendingUp, CircleDollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCustomerLedger } from "@/lib/ledger";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { PaymentForm } from "@/components/forms/payment-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, PAYMENT_MODE_LABELS } from "@/lib/constants";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  const { trips, payments, billed, received, outstanding } = await getCustomerLedger(id);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          <ArrowLeft className="size-4" /> Back to Customers
        </Link>
      </div>

      <PageHeader
        title={customer.name}
        description={`${customer.code} · ${customer.phone}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/customers/${customer.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Billed" value={formatCurrency(billed)} icon={CircleDollarSign} />
        <StatCard label="Total Received" value={formatCurrency(received)} icon={TrendingUp} tone="success" />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          icon={Wallet}
          tone={outstanding > 0 ? "danger" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact &amp; Billing Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Info label="Email">{customer.email ?? "—"}</Info>
          <Info label="GST Number">{customer.gstNumber ?? "—"}</Info>
          <Info label="Status">
            <Badge className={customer.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-zinc-100 text-zinc-600"}>
              {customer.isActive ? "Active" : "Inactive"}
            </Badge>
          </Info>
          <Info label="Customer Since">{formatDate(customer.createdAt)}</Info>
          {customer.address && (
            <div className="col-span-full">
              <p className="text-xs text-zinc-400">Address</p>
              <p className="text-zinc-700 dark:text-zinc-300">{customer.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record a Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentForm type="CUSTOMER_RECEIPT" entityField="customerId" entityId={customer.id} label="Payment" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No trips yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Charges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <Link href={`/trip-sheets/${t.id}`} className="hover:underline">
                        {t.tripNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(t.tripDate)}</TableCell>
                    <TableCell>{t.vehicle.plateNumber}</TableCell>
                    <TableCell>
                      <Badge className={TRIP_STATUS_COLORS[t.tripStatus]}>{TRIP_STATUS_LABELS[t.tripStatus]}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(t.customerCharges)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState icon={Receipt} title="No payments recorded yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.date)}</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell>{PAYMENT_MODE_LABELS[p.mode]}</TableCell>
                    <TableCell>{p.reference ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-zinc-800 dark:text-zinc-200">{children}</p>
    </div>
  );
}
