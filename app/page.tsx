import { redirect } from "next/navigation";

// Middleware handles routing authenticated users to /dashboard or /portal
// and unauthenticated users to /login. This is a safety-net fallback.
export default function RootPage() {
  redirect("/login");
}
