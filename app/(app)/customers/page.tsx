import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency, toNumber } from "@/lib/utils";

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { code: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { tripSheets: { select: { customerCharges: true } }, payments: { select: { amount: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description={`${total} customer${total === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="size-4" /> Add Customer
            </Link>
          </Button>
        }
      />

      <SearchInput placeholder="Search by name, code, or phone…" />

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Add your first customer." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => {
                const billed = c.tripSheets.reduce((s, t) => s + toNumber(t.customerCharges), 0);
                const received = c.payments.reduce((s, p) => s + toNumber(p.amount), 0);
                const outstanding = billed - received;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                      <Link href={`/customers/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          c.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400"
                        }
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className={outstanding > 0 ? "font-medium text-rose-600 dark:text-rose-400" : ""}>
                      {formatCurrency(outstanding)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} basePath="/customers" searchParams={params} />
        </>
      )}
    </div>
  );
}
