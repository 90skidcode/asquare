import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DealerForm } from "@/components/forms/dealer-form";

export default async function EditDealerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dealer = await prisma.dealer.findUnique({ where: { id } });
  if (!dealer) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title={`Edit ${dealer.name}`} description="Update dealer details." />
      <Card>
        <CardContent className="pt-5">
          <DealerForm dealer={dealer} />
        </CardContent>
      </Card>
    </div>
  );
}
