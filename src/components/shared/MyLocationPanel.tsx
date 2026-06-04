// Shared MyLocationPanel — portable wrapper around the AidAngel MyLocation panel.
// Documented API:
//   <MyLocationPanel locale?="au" | ... />
// Strict privacy gate: GPS / W3W / address lookups only run after the user
// explicitly taps "Get My Location".
import LegacyMyLocation from "@/components/MyLocation";

export interface MyLocationPanelProps {
  locale?: string;
}

export function MyLocationPanel(_props: MyLocationPanelProps = {}) {
  return <LegacyMyLocation />;
}

export default MyLocationPanel;
