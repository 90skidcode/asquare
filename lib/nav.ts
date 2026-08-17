import type { Role } from "@/app/generated/prisma";
import {
  LayoutDashboard,
  Car,
  Users,
  Building2,
  Handshake,
  ClipboardList,
  FileBarChart,
  UserCog,
  Wallet,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF"] },
  { label: "Trip Sheets", href: "/trip-sheets", icon: ClipboardList, roles: ["ADMIN", "STAFF"] },
  { label: "Vehicles", href: "/vehicles", icon: Car, roles: ["ADMIN", "STAFF"] },
  { label: "Customers", href: "/customers", icon: Users, roles: ["ADMIN", "STAFF"] },
  { label: "Dealers", href: "/dealers", icon: Building2, roles: ["ADMIN", "STAFF"] },
  { label: "Investors", href: "/investors", icon: Handshake, roles: ["ADMIN", "STAFF"] },
  { label: "Reports", href: "/reports", icon: FileBarChart, roles: ["ADMIN", "STAFF"] },
  { label: "Users", href: "/users", icon: UserCog, roles: ["ADMIN"] },
  { label: "My Portal", href: "/portal", icon: Wallet, roles: ["DEALER", "INVESTOR"] },
];
