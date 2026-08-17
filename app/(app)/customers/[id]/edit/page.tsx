import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerForm } from "@/components/forms/customer-form";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title={`Edit ${customer.name}`} description="Update customer details." />
      <Card>
        <CardContent className="pt-5">
          <CustomerForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
