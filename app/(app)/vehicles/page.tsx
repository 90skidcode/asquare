import Link from "next/link";
import { Plus, Car } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS } from "@/lib/constants";

const PAGE_SIZE = 20;

export default async function VehiclesPage({
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
          { plateNumber: { contains: q, mode: "insensitive" as const } },
          { model: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { investor: true, dealer: true, _count: { select: { tripSheets: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.vehicle.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vehicles"
        description={`${total} vehicle${total === 1 ? "" : "s"} in the fleet`}
        actions={
          <Button asChild>
            <Link href="/vehicles/new">
              <Plus className="size-4" /> Add Vehicle
            </Link>
          </Button>
        }
      />

      <SearchInput placeholder="Search by plate number or model…" />

      {vehicles.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles found" description="Add your first vehicle to the fleet." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plate No.</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Investor</TableHead>
                <TableHead>Dealer</TableHead>
                <TableHead>Trips</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id} className="cursor-pointer">
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    <Link href={`/vehicles/${v.id}`} className="hover:underline">
                      {v.plateNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {v.model}
                    {v.type && <span className="text-zinc-400"> · {v.type}</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className={VEHICLE_STATUS_COLORS[v.status]}>{VEHICLE_STATUS_LABELS[v.status]}</Badge>
                  </TableCell>
                  <TableCell>{v.investor?.name ?? "—"}</TableCell>
                  <TableCell>{v.dealer?.name ?? "—"}</TableCell>
                  <TableCell>{v._count.tripSheets}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} basePath="/vehicles" searchParams={params} />
        </>
      )}
    </div>
  );
}
