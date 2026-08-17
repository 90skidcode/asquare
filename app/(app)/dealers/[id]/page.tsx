import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Pencil,
  ArrowLeft,
  ClipboardList,
  Receipt,
  Car,
  Wallet,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getDealerLedger } from "@/lib/ledger";
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

export default async function DealerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dealer = await prisma.dealer.findUnique({ where: { id } });
  if (!dealer) notFound();

  const { trips, payments, vehicles, billed, paid, outstanding } = await getDealerLedger(id);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/dealers" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          <ArrowLeft className="size-4" /> Back to Dealers
        </Link>
      </div>

      <PageHeader
        title={dealer.name}
        description={`${dealer.code} · ${dealer.phone} · ${Number(dealer.commissionRate)}% commission`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/dealers/${dealer.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Dealer Charges" value={formatCurrency(billed)} icon={CircleDollarSign} />
        <StatCard label="Total Paid" value={formatCurrency(paid)} icon={TrendingUp} tone="success" />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          icon={Wallet}
          tone={outstanding > 0 ? "danger" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Info label="Email">{dealer.email ?? "—"}</Info>
          <Info label="Status">
            <Badge className={dealer.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-zinc-100 text-zinc-600"}>
              {dealer.isActive ? "Active" : "Inactive"}
            </Badge>
          </Info>
          <Info label="Assigned Vehicles">{vehicles.length}</Info>
          <Info label="Dealer Since">{formatDate(dealer.createdAt)}</Info>
          {dealer.address && (
            <div className="col-span-full">
              <p className="text-xs text-zinc-400">Address</p>
              <p className="text-zinc-700 dark:text-zinc-300">{dealer.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <EmptyState icon={Car} title="No vehicles assigned" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {vehicles.map((v) => (
                <Link key={v.id} href={`/vehicles/${v.id}`}>
                  <Badge className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                    {v.plateNumber}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record a Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentForm type="DEALER_PAYMENT" entityField="dealerId" entityId={dealer.id} label="Payment" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip Sheets</CardTitle>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dealer Charges</TableHead>
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
                    <TableCell>{t.customer.name}</TableCell>
                    <TableCell>
                      <Badge className={TRIP_STATUS_COLORS[t.tripStatus]}>{TRIP_STATUS_LABELS[t.tripStatus]}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(t.dealerCharges)}</TableCell>
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
