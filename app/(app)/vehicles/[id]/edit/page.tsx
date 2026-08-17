import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleForm } from "@/components/forms/vehicle-form";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, investors, dealers] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id } }),
    prisma.investor.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.dealer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);
  if (!vehicle) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title={`Edit ${vehicle.plateNumber}`} description="Update vehicle details." />
      <Card>
        <CardContent className="pt-5">
          <VehicleForm
            vehicle={vehicle}
            investors={investors.map((i) => ({ id: i.id, label: `${i.name} (${i.code})` }))}
            dealers={dealers.map((d) => ({ id: d.id, label: `${d.name} (${d.code})` }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
