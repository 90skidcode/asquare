import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const PAGE_SIZE = 20;

export default async function DealersPage({
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
        ],
      }
    : {};

  const [dealers, total] = await Promise.all([
    prisma.dealer.findMany({
      where,
      include: { _count: { select: { vehicles: true, tripSheets: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.dealer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dealers"
        description={`${total} dealer${total === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/dealers/new">
              <Plus className="size-4" /> Add Dealer
            </Link>
          </Button>
        }
      />

      <SearchInput placeholder="Search by name or code…" />

      {dealers.length === 0 ? (
        <EmptyState icon={Building2} title="No dealers found" description="Add your first dealer." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dealers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.code}</TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    <Link href={`/dealers/${d.id}`} className="hover:underline">
                      {d.name}
                    </Link>
                  </TableCell>
                  <TableCell>{d.phone}</TableCell>
                  <TableCell>{Number(d.commissionRate)}%</TableCell>
                  <TableCell>{d._count.vehicles}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        d.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400"
                      }
                    >
                      {d.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} basePath="/dealers" searchParams={params} />
        </>
      )}
    </div>
  );
}
