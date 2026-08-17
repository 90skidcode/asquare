import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerForm } from "@/components/forms/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="Add Customer" description="Register a new customer." />
      <Card>
        <CardContent className="pt-5">
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
