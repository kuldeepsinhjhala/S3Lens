"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (open && !node.open) {
      node.showModal();
    } else if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-0 m-auto h-fit w-[min(92vw,32rem)] max-h-[calc(100vh-2rem)] overflow-auto rounded-xl border border-border bg-background p-0 text-text-primary shadow-xl backdrop:bg-[rgb(30_6_53_/_0.45)]"
    >
      <form
        method="dialog"
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="px-5 py-4 text-sm">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-border bg-background-secondary px-5 py-3">
            {footer}
          </div>
        ) : null}
      </form>
    </dialog>
  );
}
