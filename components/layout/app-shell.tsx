"use client";

import { useState, type ReactNode } from "react";
import type { Role } from "@/app/generated/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

export function AppShell({
  role,
  userName,
  userEmail,
  children,
}: {
  role: Role;
  userName: string;
  userEmail: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar role={role} className="hidden md:flex" />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <Sidebar role={role} className={cn("absolute inset-y-0 left-0 flex shadow-xl")} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={userName}
          userEmail={userEmail}
          role={role}
          onMenuClick={() => setMobileOpen((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
