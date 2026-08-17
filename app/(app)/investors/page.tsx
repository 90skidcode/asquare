import Link from "next/link";
import { Plus, Handshake } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { PaginationControls } from "@/components/pagination-controls";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const PAGE_SIZE = 20;

export default async function InvestorsPage({
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

  const [investors, total] = await Promise.all([
    prisma.investor.findMany({
      where,
      include: { _count: { select: { vehicles: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.investor.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Investors"
        description={`${total} investor${total === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/investors/new">
              <Plus className="size-4" /> Add Investor
            </Link>
          </Button>
        }
      />

      <SearchInput placeholder="Search by name or code…" />

      {investors.length === 0 ? (
        <EmptyState icon={Handshake} title="No investors found" description="Add your first investor." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investors.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.code}</TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    <Link href={`/investors/${i.id}`} className="hover:underline">
                      {i.name}
                    </Link>
                  </TableCell>
                  <TableCell>{i.phone}</TableCell>
                  <TableCell>{i._count.vehicles}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        i.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400"
                      }
                    >
                      {i.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls page={page} totalPages={totalPages} basePath="/investors" searchParams={params} />
        </>
      )}
    </div>
  );
}
