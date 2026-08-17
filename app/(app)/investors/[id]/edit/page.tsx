import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { InvestorForm } from "@/components/forms/investor-form";

export default async function EditInvestorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const investor = await prisma.investor.findUnique({ where: { id } });
  if (!investor) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title={`Edit ${investor.name}`} description="Update investor details." />
      <Card>
        <CardContent className="pt-5">
          <InvestorForm investor={investor} />
        </CardContent>
      </Card>
    </div>
  );
}
