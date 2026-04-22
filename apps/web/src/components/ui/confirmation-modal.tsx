"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmationType = "info" | "warning" | "danger" | "success";

export function ConfirmationModal({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);

  const confirmVariant =
    type === "danger" ? "destructive" : type === "success" ? "default" : "default";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <DialogFooter>
          {cancelText ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
          ) : null}
          <Button
            variant={confirmVariant as any}
            disabled={busy}
            onClick={async () => {
              try {
                setBusy(true);
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

