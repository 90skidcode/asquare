import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { InvestorForm } from "@/components/forms/investor-form";

export default function NewInvestorPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="Add Investor" description="Register a new investor." />
      <Card>
        <CardContent className="pt-5">
          <InvestorForm />
        </CardContent>
      </Card>
    </div>
  );
}
