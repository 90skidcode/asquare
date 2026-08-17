import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleForm } from "@/components/forms/vehicle-form";

export default async function NewVehiclePage() {
  const [investors, dealers] = await Promise.all([
    prisma.investor.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.dealer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="Add Vehicle" description="Register a new vehicle to the fleet." />
      <Card>
        <CardContent className="pt-5">
          <VehicleForm
            investors={investors.map((i) => ({ id: i.id, label: `${i.name} (${i.code})` }))}
            dealers={dealers.map((d) => ({ id: d.id, label: `${d.name} (${d.code})` }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
