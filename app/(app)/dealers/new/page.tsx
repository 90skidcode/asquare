import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { DealerForm } from "@/components/forms/dealer-form";

export default function NewDealerPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="Add Dealer" description="Register a new dealer." />
      <Card>
        <CardContent className="pt-5">
          <DealerForm />
        </CardContent>
      </Card>
    </div>
  );
}
