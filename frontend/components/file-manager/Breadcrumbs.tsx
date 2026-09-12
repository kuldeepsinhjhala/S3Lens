import Link from "next/link";

type BreadcrumbsProps = {
  bucketName: string;
  prefix: string;
};

export function Breadcrumbs({ bucketName, prefix }: BreadcrumbsProps) {
  const segments = prefix.split("/").filter(Boolean);
  const base = `/bucket/${encodeURIComponent(bucketName)}`;

  return (
    <nav aria-label="Folder path" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link
            href={base}
            className={`font-medium ${segments.length === 0 ? "text-brand" : "text-brand hover:text-brand-light"}`}
          >
            Home
          </Link>
        </li>
        {segments.map((segment, index) => {
          const target = `${segments.slice(0, index + 1).join("/")}/`;
          const current = index === segments.length - 1;

          return (
            <li key={target} className="flex items-center gap-1">
              <span className="text-text-muted">/</span>
              <Link
                href={`${base}?prefix=${encodeURIComponent(target)}`}
                className={
                  current
                    ? "font-medium text-brand"
                    : "font-medium text-text-secondary hover:text-brand"
                }
              >
                {segment}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
