import { type ReactNode } from "react";
import CallConfirmDialog from "@/components/shared/CallConfirmDialog";
import { useCountry } from "@/hooks/useCountry";
import { emergencyNumberForCountry } from "@/lib/donations";

const KNOWN_EMERGENCY_NUMBERS = new Set([
  "000",
  "911",
  "112",
  "999",
  "111",
  "999112",
  "911112",
]);

export function normalizePhoneNumber(value = "") {
  return value.replace(/^tel:/i, "").replace(/[^0-9+]/g, "").replace(/^\+/, "");
}

export function isEmergencyNumber(value = "", localNumber?: string) {
  const normalized = normalizePhoneNumber(value);
  const local = normalizePhoneNumber(localNumber ?? "");
  return normalized.length > 0 && (KNOWN_EMERGENCY_NUMBERS.has(normalized) || normalized === local);
}

interface EmergencyNumberLinkProps {
  number?: string;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
  title?: string;
}

export default function EmergencyNumberLink({
  number: numberOverride,
  children,
  className,
  ariaLabel,
  title,
}: EmergencyNumberLinkProps) {
  const { code } = useCountry();
  const number = numberOverride ?? emergencyNumberForCountry(code);

  return (
    <CallConfirmDialog number={number}>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel ?? `Open emergency location help before calling ${number}`}
        title={title ?? `Open emergency location help before calling ${number}`}
      >
        {children ?? number}
      </button>
    </CallConfirmDialog>
  );
}
