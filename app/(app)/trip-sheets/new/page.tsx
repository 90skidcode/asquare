import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TripSheetForm } from "@/components/forms/trip-sheet-form";

export default async function NewTripSheetPage() {
  const [customers, vehicles, dealers, investors] = await Promise.all([
    prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ where: { status: "ACTIVE" }, orderBy: { plateNumber: "asc" } }),
    prisma.dealer.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.investor.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader title="Create Trip Sheet" description="Record a new trip with all associated charges and details." />
      <Card>
        <CardContent className="pt-5">
          <TripSheetForm
            customers={customers.map((c) => ({ id: c.id, label: `${c.name} (${c.code})` }))}
            vehicles={vehicles.map((v) => ({ id: v.id, label: v.plateNumber }))}
            dealers={dealers.map((d) => ({ id: d.id, label: `${d.name} (${d.code})` }))}
            investors={investors.map((i) => ({ id: i.id, label: `${i.name} (${i.code})` }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
