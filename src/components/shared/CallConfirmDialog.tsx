import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCountry } from "@/hooks/useCountry";
import { emergencyNumberForCountry } from "@/lib/donations";
import MyLocationPanel from "./MyLocationPanel";

export interface CallConfirmDialogProps {
  /** Trigger element. Rendered as the dialog opener (asChild). */
  children: ReactNode;
  /** Override the emergency number. Defaults to the detected country's number. */
  number?: string;
  /** Short context for the description, e.g. "Police · Fire · Ambulance". */
  serviceLabel?: string;
}

/**
 * Wraps an emergency-call trigger with a confirmation dialog that lets the
 * caller capture their location (coordinates + nearest address + what3words)
 * BEFORE dialing, so they can read it straight to the operator. The final
 * action is a tel: link that places the actual call.
 *
 * Mirrors the Love Key HELP Network confirm-before-dial pattern used on
 * crisis-compass.org, but reuses AidAngel's own MyLocation panel so location
 * capture, what3words and address lookup are shared with the /my-location page.
 */
export default function CallConfirmDialog({
  children,
  number: numberOverride,
}: CallConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const { code } = useCountry();
  const number = numberOverride ?? emergencyNumberForCountry(code);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto [&>button.right-4.top-4]:hidden">
        {/* Visible header removed by request; sr-only title retained for accessibility. */}
        <DialogTitle className="sr-only">Emergency call and location help — {number}</DialogTitle>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close"
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-7 w-7" aria-hidden="true" />
          </button>
        </DialogClose>

        <MyLocationPanel embedded />

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-3 w-full rounded-md border bg-background py-2 px-4 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </DialogContent>
    </Dialog>
  );
}
