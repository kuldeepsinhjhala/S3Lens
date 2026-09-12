import Link from "next/link";
import type { ReactNode } from "react";

type AppHeaderProps = {
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function AppHeader({ action, backHref, backLabel }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link
              href={backHref}
              className="text-sm font-medium text-brand hover:text-brand-light"
            >
              {backLabel ?? "← Buckets"}
            </Link>
          ) : null}
          <Link href="/" className="text-lg font-semibold tracking-tight text-brand">
            S3Lens
          </Link>
        </div>
        {action}
      </div>
    </header>
  );
}
