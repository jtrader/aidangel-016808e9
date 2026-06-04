// Shared EmergencyBanner — portable wrapper around the AidAngel banner.
// Documented API:
//   <EmergencyBanner locale?="au" | "nz" | ... />
// Renders the country's emergency number with a tel: link.
import LegacyEmergencyBanner from "@/components/EmergencyBanner";

export interface EmergencyBannerProps {
  /** ISO country code (lowercase). Currently passed through; the underlying
   *  component reads visitor country from useCountry(). */
  locale?: string;
}

export function EmergencyBanner(_props: EmergencyBannerProps = {}) {
  return <LegacyEmergencyBanner />;
}

export default EmergencyBanner;
