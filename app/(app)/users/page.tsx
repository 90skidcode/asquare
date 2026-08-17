import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { SearchInput } from "@/components/search-input";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ROLE_LABELS } from "@/lib/constants";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await prisma.user.findMany({
    where,
    include: { dealer: true, investor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description={`${users.length} user${users.length === 1 ? "" : "s"}`}
        actions={
          <Button asChild>
            <Link href="/users/new">
              <Plus className="size-4" /> Add User
            </Link>
          </Button>
        }
      />

      <SearchInput placeholder="Search by name or email…" />

      {users.length === 0 ? (
        <EmptyState icon={UserCog} title="No users found" description="Create your first user account." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="font-mono text-xs">{u.email}</TableCell>
                <TableCell>
                  <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </TableCell>
                <TableCell>{u.dealer?.name || u.investor?.name || "—"}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      u.isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400"
                    }
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
