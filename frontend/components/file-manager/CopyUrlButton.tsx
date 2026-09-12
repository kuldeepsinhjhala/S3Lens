"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type CopyUrlButtonProps = {
  url: string | null;
};

export function CopyUrlButton({ url }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!url) {
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="secondary" onClick={() => void copy()} disabled={!url}>
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
