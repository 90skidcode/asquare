import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <p className="text-xs text-zinc-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" className={page <= 1 ? "pointer-events-none opacity-40" : ""}>
          <Link href={hrefFor(Math.max(1, page - 1))}>
            <ChevronLeft className="size-4" /> Prev
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={page >= totalPages ? "pointer-events-none opacity-40" : ""}
        >
          <Link href={hrefFor(Math.min(totalPages, page + 1))}>
            Next <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
