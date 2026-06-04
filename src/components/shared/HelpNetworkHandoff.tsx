// Shared HelpNetworkHandoff — cross-site navigation that hides during
// immediate-danger contexts.
export interface HelpNetworkHandoffProps {
  /** When true, the handoff is hidden (e.g. user is in immediate danger). */
  immediateDanger?: boolean;
  links?: Array<{ label: string; href: string }>;
}

const DEFAULT_LINKS = [
  { label: "First Aid Angel", href: "https://firstaidangel.org" },
];

export function HelpNetworkHandoff({
  immediateDanger = false,
  links = DEFAULT_LINKS,
}: HelpNetworkHandoffProps) {
  if (immediateDanger) return null;
  return (
    <nav aria-label="HELP Network" className="flex flex-wrap gap-2 text-sm">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="rounded-md border border-border px-3 py-1.5 hover:bg-accent transition-colors"
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}

export default HelpNetworkHandoff;
