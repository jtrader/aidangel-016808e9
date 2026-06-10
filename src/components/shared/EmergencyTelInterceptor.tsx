import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCountry } from "@/hooks/useCountry";
import { emergencyNumberForCountry } from "@/lib/donations";
import { isEmergencyNumber, normalizePhoneNumber } from "@/components/shared/EmergencyNumberLink";
import MyLocationPanel from "@/components/shared/MyLocationPanel";

export default function EmergencyTelInterceptor() {
  const { code } = useCountry();
  const fallbackNumber = emergencyNumberForCountry(code);
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState(fallbackNumber);

  useEffect(() => {
    setNumber(fallbackNumber);
  }, [fallbackNumber]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href^="tel:"]');
      if (!anchor) return;
      if (anchor.closest("[data-emergency-dialog]")) return;

      const href = anchor.getAttribute("href") ?? "";
      if (!isEmergencyNumber(href, fallbackNumber)) return;

      event.preventDefault();
      event.stopPropagation();
      setNumber(normalizePhoneNumber(href) || fallbackNumber);
      setOpen(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [fallbackNumber]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" data-emergency-dialog>
        <DialogTitle className="sr-only">Emergency call and location help — {number}</DialogTitle>
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
