"use client";

import { Menu, LogOut } from "lucide-react";
import type { Role } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

export function Topbar({
  userName,
  userEmail,
  role,
  onMenuClick,
}: {
  userName: string;
  userEmail: string;
  role: Role;
  onMenuClick: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="size-5" />
        </Button>
        <Badge className="hidden sm:inline-flex bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
          {ROLE_LABELS[role]}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-zinc-900 dark:text-zinc-50">{userName}</p>
          <p className="text-xs leading-tight text-zinc-400">{userEmail}</p>
        </div>
        <div className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {initials(userName)}
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" size="icon" type="submit" title="Sign out">
            <LogOut className="size-4.5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
