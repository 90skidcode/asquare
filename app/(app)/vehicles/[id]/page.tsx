import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, ClipboardList, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { EmptyState } from "@/components/empty-state";
import { deleteVehicle } from "@/actions/vehicles";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_COLORS,
  TRIP_STATUS_LABELS,
  TRIP_STATUS_COLORS,
} from "@/lib/constants";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      investor: true,
      dealer: true,
      tripSheets: {
        orderBy: { tripDate: "desc" },
        take: 25,
        include: { customer: true },
      },
    },
  });
  if (!vehicle) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link href="/vehicles" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          <ArrowLeft className="size-4" /> Back to Vehicles
        </Link>
      </div>

      <PageHeader
        title={vehicle.plateNumber}
        description={vehicle.model}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/vehicles/${vehicle.id}/edit`}>
                <Pencil className="size-4" /> Edit
              </Link>
            </Button>
            <ConfirmActionButton
              action={deleteVehicle.bind(null, vehicle.id)}
              confirmMessage="Delete this vehicle? This can't be undone."
              successMessage="Vehicle deleted"
              icon={Trash2}
              variant="outline"
            >
              Delete
            </ConfirmActionButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Info label="Status">
              <Badge className={VEHICLE_STATUS_COLORS[vehicle.status]}>{VEHICLE_STATUS_LABELS[vehicle.status]}</Badge>
            </Info>
            <Info label="Type">{vehicle.type ?? "—"}</Info>
            <Info label="Capacity">{vehicle.capacity ?? "—"}</Info>
            <Info label="Investor">{vehicle.investor?.name ?? "—"}</Info>
            <Info label="Dealer">{vehicle.dealer?.name ?? "—"}</Info>
            <Info label="Added">{formatDate(vehicle.createdAt)}</Info>
            {vehicle.notes && (
              <div className="col-span-full">
                <p className="text-xs text-zinc-400">Notes</p>
                <p className="text-zinc-700 dark:text-zinc-300">{vehicle.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Total Trips">{vehicle.tripSheets.length}</Info>
            <Info label="Total Revenue">
              {formatCurrency(vehicle.tripSheets.reduce((sum, t) => sum + Number(t.customerCharges), 0))}
            </Info>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trip Sheets</CardTitle>
        </CardHeader>
        <CardContent>
          {vehicle.tripSheets.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No trips recorded yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Charges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicle.tripSheets.map((t) => (
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
                    <TableCell>{formatCurrency(t.customerCharges)}</TableCell>
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
