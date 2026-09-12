type ConfirmNameFieldProps = {
  expected: string;
  value: string;
  onChange: (value: string) => void;
  noun: string;
};

export function namesMatch(expected: string, typed: string): boolean {
  return typed.trim() === expected;
}

export function ConfirmNameField({
  expected,
  value,
  onChange,
  noun,
}: ConfirmNameFieldProps) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-text-secondary">
        Type <span className="break-all font-medium text-text-primary">{expected}</span>{" "}
        to confirm you want to delete this {noun}.
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        className="w-full rounded-md border border-border px-3 py-2 font-mono text-sm"
        placeholder={expected}
      />
    </label>
  );
}
