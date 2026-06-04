// Shared LocaleSelector — stateless region switcher (no flags).
export interface Locale {
  id: string;
  label: string;
}

export interface LocaleSelectorProps {
  value: string;
  onChange: (id: string) => void;
  options: Locale[];
}

export function LocaleSelector({ value, onChange, options }: LocaleSelectorProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Region</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LocaleSelector;
