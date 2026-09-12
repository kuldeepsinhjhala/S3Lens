type StatusBadgeProps = {
  status: string | null;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return <span className="text-sm text-text-secondary">None</span>;
  }

  if (status === "Deployed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-background px-2.5 py-1 text-xs font-medium text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Deployed
      </span>
    );
  }

  if (status === "InProgress" || status === "Disabling") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-background px-2.5 py-1 text-xs font-medium text-warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        {status === "Disabling" ? "Disabling" : "Provisioning"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-background px-2.5 py-1 text-xs font-medium text-danger">
      <span className="h-1.5 w-1.5 rounded-full bg-danger" />
      Error
    </span>
  );
}
