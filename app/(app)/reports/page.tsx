import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, toNumber } from "@/lib/utils";
import { BarChart3, FileBarChart } from "lucide-react";

export default async function ReportsPage() {
  const trips = await prisma.tripSheet.findMany({
    include: { customer: true, dealer: true, investor: true, vehicle: true },
  });

  // Dealer-wise summary
  const dealerReport = trips.reduce(
    (acc, t) => {
      if (!t.dealerId) return acc;
      if (!acc[t.dealerId]) {
        acc[t.dealerId] = { name: t.dealer?.name || "", charges: 0, trips: 0 };
      }
      acc[t.dealerId].charges += toNumber(t.dealerCharges);
      acc[t.dealerId].trips += 1;
      return acc;
    },
    {} as Record<string, { name: string; charges: number; trips: number }>
  );

  // Customer-wise summary
  const customerReport = trips.reduce(
    (acc, t) => {
      if (!acc[t.customerId]) {
        acc[t.customerId] = { name: t.customer.name, charges: 0, trips: 0 };
      }
      acc[t.customerId].charges += toNumber(t.customerCharges);
      acc[t.customerId].trips += 1;
      return acc;
    },
    {} as Record<string, { name: string; charges: number; trips: number }>
  );

  // Vehicle-wise summary
  const vehicleReport = trips.reduce(
    (acc, t) => {
      if (!acc[t.vehicleId]) {
        acc[t.vehicleId] = { plate: t.vehicle.plateNumber, revenue: 0, trips: 0 };
      }
      acc[t.vehicleId].revenue += toNumber(t.customerCharges);
      acc[t.vehicleId].trips += 1;
      return acc;
    },
    {} as Record<string, { plate: string; revenue: number; trips: number }>
  );

  const totalRevenue = trips.reduce((s, t) => s + toNumber(t.customerCharges), 0);
  const totalExpenses = trips.reduce((s, t) => s + toNumber(t.totalExpenses), 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Business analytics and summaries. Full export features coming soon."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{trips.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {formatCurrency(netProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="size-5" /> Customer-wise Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {Object.entries(customerReport)
              .sort((a, b) => b[1].charges - a[1].charges)
              .map(([id, data]) => (
                <div key={id} className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 last:border-0">
                  <span>{data.name}</span>
                  <span className="font-medium">{formatCurrency(data.charges)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" /> Dealer-wise Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {Object.entries(dealerReport)
              .sort((a, b) => b[1].charges - a[1].charges)
              .map(([id, data]) => (
                <div key={id} className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 last:border-0">
                  <span>{data.name}</span>
                  <span className="font-medium">{formatCurrency(data.charges)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" /> Vehicle-wise Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {Object.entries(vehicleReport)
              .sort((a, b) => b[1].revenue - a[1].revenue)
              .map(([id, data]) => (
                <div key={id} className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 last:border-0">
                  <span className="font-mono">{data.plate}</span>
                  <span className="font-medium">{formatCurrency(data.revenue)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
