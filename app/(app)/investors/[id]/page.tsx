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
import { getInvestorLedger } from "@/lib/ledger";
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

export default async function InvestorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const investor = await prisma.investor.findUnique({ where: { id } });
  if (!investor) notFound();

  const { trips, payments, vehicles, investments, settlementDue, settled, outstanding, totalInvested } = await getInvestorLedger(id);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/investors" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          <ArrowLeft className="size-4" /> Back to Investors
        </Link>
      </div>

      <PageHeader
        title={investor.name}
        description={`${investor.code} · ${investor.phone}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/investors/${investor.id}/edit`}>
              <Pencil className="size-4" /> Edit
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Invested" value={formatCurrency(totalInvested)} icon={CircleDollarSign} />
        <StatCard label="Settlement Due" value={formatCurrency(settlementDue)} icon={Wallet} tone="warning" />
        <StatCard label="Settled" value={formatCurrency(settled)} icon={TrendingUp} tone="success" />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          icon={Wallet}
          tone={outstanding > 0 ? "danger" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact &amp; Banking Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Info label="Email">{investor.email ?? "—"}</Info>
          <Info label="Status">
            <Badge className={investor.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-zinc-100 text-zinc-600"}>
              {investor.isActive ? "Active" : "Inactive"}
            </Badge>
          </Info>
          <Info label="Bank Name">{investor.bankName ?? "—"}</Info>
          <Info label="Account">{investor.bankAccount ? `...${investor.bankAccount.slice(-4)}` : "—"}</Info>
          {investor.address && (
            <div className="col-span-full">
              <p className="text-xs text-zinc-400">Address</p>
              <p className="text-zinc-700 dark:text-zinc-300">{investor.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associated Vehicles</CardTitle>
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
          <CardTitle>Investment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <EmptyState icon={CircleDollarSign} title="No investments recorded" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Vehicle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{formatDate(inv.date)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell>{inv.vehicle?.plateNumber ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Settlement</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentForm type="INVESTOR_SETTLEMENT" entityField="investorId" entityId={investor.id} label="Settlement" />
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
                  <TableHead>Settlement</TableHead>
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
                    <TableCell>{formatCurrency(t.investorSettlement)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState icon={Receipt} title="No settlements recorded yet" />
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
