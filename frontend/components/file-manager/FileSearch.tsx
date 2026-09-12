import { Search, X } from "lucide-react";

type FileSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function FileSearch({ value, onChange }: FileSearchProps) {
  return (
    <div role="search" className="relative min-w-0 w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search this folder"
        autoComplete="off"
        spellCheck={false}
        aria-label="Search files and folders in this folder"
        className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-9 text-sm text-text-primary placeholder:text-text-muted"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-background-hover hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export function matchesSearch(name: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return name.toLowerCase().includes(needle);
}
