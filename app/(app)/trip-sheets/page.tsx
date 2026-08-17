import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/constants";

const PAGE_SIZE = 20;

export default async function TripSheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where = q
    ? {
        OR: [
          { tripNumber: { contains: q, mode: "insensitive" as const } },
          { customer: { name: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [trips, total] = await Promise.all([
    prisma.tripSheet.findMany({
      where,
      include: { customer: true, vehicle: true },
      orderBy: { tripDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.tripSheet.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Trip Sheets"
        description={`${total} trip${total === 1 ? "" : "s"} recorded`}
        actions={
          <Button asChild>
            <Link href="/trip-sheets/new">
              <Plus className="size-4" /> New Trip
            </Link>
          </Button>
        }
      />

      <SearchInput placeholder="Search by trip number or customer…" />

      {trips.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No trip sheets found"
          description="Create your first trip sheet to get started."
          action={
            <Button asChild size="sm">
              <Link href="/trip-sheets/new">Create Trip Sheet</Link>
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Trip Status</TableHead>
                <TableHead>Payment</TableHead>
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
                  <TableCell>{t.totalKm.toFixed(1)} km</TableCell>
                  <TableCell>{formatCurrency(t.customerCharges)}</TableCell>
                  <TableCell>
                    <Badge className={TRIP_STATUS_COLORS[t.tripStatus]}>
                      {TRIP_STATUS_LABELS[t.tripStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PAYMENT_STATUS_COLORS[t.paymentStatus]}>
                      {PAYMENT_STATUS_LABELS[t.paymentStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} basePath="/trip-sheets" searchParams={params} />
        </>
      )}
    </div>
  );
}
