"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/app/generated/prisma";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Boxes } from "lucide-react";

export function Sidebar({ role, className }: { role: Role; className?: string }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav
      className={cn(
        "flex h-full w-60 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
        className
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Boxes className="size-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">A SQUARE</p>
          <p className="text-[11px] text-zinc-400">Report Management</p>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              )}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
