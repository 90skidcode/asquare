import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  Users,
  Building2,
  Handshake,
  TrendingUp,
  CircleDollarSign,
  AlertCircle,
} from "lucide-react";
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS } from "@/lib/constants";

export default async function DashboardPage() {
  const [vehicles, customers, dealers, investors, trips] = await Promise.all([
    prisma.vehicle.count(),
    prisma.customer.count(),
    prisma.dealer.count(),
    prisma.investor.count(),
    prisma.tripSheet.findMany({
      orderBy: { tripDate: "desc" },
      take: 10,
      include: { customer: true, vehicle: true },
    }),
  ]);

  const pendingPayment = trips.filter((t) => t.paymentStatus !== "PAID").length;
  const totalCollections = trips.reduce((s, t) => s + toNumber(t.customerCharges), 0);
  const monthlyRevenue = trips
    .filter((t) => {
      const now = new Date();
      return (
        t.tripDate.getMonth() === now.getMonth() &&
        t.tripDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, t) => s + toNumber(t.customerCharges), 0);

  const utilization = vehicles > 0 ? Math.round((trips.length / (vehicles * 30)) * 100) : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" description="Overview of your fleet and operations." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Vehicles" value={String(vehicles)} icon={Car} />
        <StatCard label="Total Customers" value={String(customers)} icon={Users} />
        <StatCard label="Total Dealers" value={String(dealers)} icon={Building2} />
        <StatCard label="Total Investors" value={String(investors)} icon={Handshake} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Pending Payments" value={String(pendingPayment)} icon={AlertCircle} tone="warning" />
        <StatCard label="Total Collections" value={formatCurrency(totalCollections)} icon={CircleDollarSign} tone="success" />
        <StatCard label="Monthly Revenue" value={formatCurrency(monthlyRevenue)} icon={TrendingUp} tone="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{utilization}%</p>
              <p className="text-sm text-zinc-400">of fleet capacity</p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/trip-sheets">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{t.vehicle.plateNumber}</TableCell>
                  <TableCell>{formatCurrency(t.customerCharges)}</TableCell>
                  <TableCell>
                    <Badge className={TRIP_STATUS_COLORS[t.tripStatus]}>
                      {TRIP_STATUS_LABELS[t.tripStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
