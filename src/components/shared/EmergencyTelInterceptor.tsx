import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCountry } from "@/hooks/useCountry";
import { emergencyNumberForCountry } from "@/lib/donations";
import { isEmergencyNumber, normalizePhoneNumber } from "@/components/shared/EmergencyNumberLink";
import MyLocationPanel from "@/components/shared/MyLocationPanel";

const LEGACY_ST_JOHN_TEXT = "St John of God";
const UPDATED_ST_JOHN_TEXT = "St John Australia";
const TEXT_ATTRIBUTES = ["aria-label", "alt", "placeholder", "title"];

function replaceLegacyText(value: string) {
  return value.replace(new RegExp(LEGACY_ST_JOHN_TEXT, "g"), UPDATED_ST_JOHN_TEXT);
}

function replaceLegacyTextInDom(root: ParentNode = document) {
  if (typeof document === "undefined") return;

  if (document.title.includes(LEGACY_ST_JOHN_TEXT)) {
    document.title = replaceLegacyText(document.title);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeValue?.includes(LEGACY_ST_JOHN_TEXT)) {
      node.nodeValue = replaceLegacyText(node.nodeValue);
    }
    node = walker.nextNode();
  }

  if (root instanceof Element || root instanceof Document) {
    const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(root.querySelectorAll("*"));
    for (const el of elements) {
      for (const attr of TEXT_ATTRIBUTES) {
        const value = el.getAttribute(attr);
        if (value?.includes(LEGACY_ST_JOHN_TEXT)) {
          el.setAttribute(attr, replaceLegacyText(value));
        }
      }
    }
  }
}

export default function EmergencyTelInterceptor() {
  const { code } = useCountry();
  const fallbackNumber = emergencyNumberForCountry(code);
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState(fallbackNumber);

  useEffect(() => {
    setNumber(fallbackNumber);
  }, [fallbackNumber]);

  useEffect(() => {
    replaceLegacyTextInDom(document);

    let queued = false;
    const queueReplace = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        replaceLegacyTextInDom(document);
      });
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" || mutation.type === "characterData" || mutation.type === "attributes") {
          queueReplace();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TEXT_ATTRIBUTES,
    });

    return () => observer.disconnect();
  }, []);

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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto [&>button.right-4.top-4]:hidden" data-emergency-dialog>
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
