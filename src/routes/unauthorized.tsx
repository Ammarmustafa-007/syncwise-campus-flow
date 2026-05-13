import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({ meta: [{ title: "Unauthorized — SyncWise" }] }),
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldOff className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to view the admin dashboard. Sign in with an admin account.
        </p>
        <Link to="/login" className="mt-6 inline-flex rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand">
          Go to login
        </Link>
      </div>
    </div>
  ),
});
