import { type ReactNode } from "react";
import CallConfirmDialog from "@/components/shared/CallConfirmDialog";
import { useCountry } from "@/hooks/useCountry";
import { emergencyNumberForCountry } from "@/lib/donations";

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
