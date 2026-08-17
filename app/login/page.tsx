import { Suspense } from "react";
import { Boxes } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Sign in — A SQUARE" };

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Boxes className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">A SQUARE</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Report Management System</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Contact your administrator if you don&apos;t have login credentials.
        </p>
      </div>
    </div>
  );
}
