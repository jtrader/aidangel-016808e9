# Shared HELP Network Components

Portable, site-agnostic components used across the HELP Network sites
(starting with First Aid Angel).

## API

| Component | Props | Notes |
|---|---|---|
| `EmergencyBanner` | `locale?: string` | Red banner with country's emergency number as `tel:` link. |
| `MyLocationPanel` | `locale?: string` | GPS + what3words + reverse-geocode panel. Privacy gated. |
| `ServiceCard` | `title, description?, icon?, href?, onClick?, routeType?` | Standard list card. |
| `LocaleSelector` | `value, onChange, options` | Stateless region switcher (no flags). |
| `HelpNetworkHandoff` | `immediateDanger?, links?` | Cross-site nav; hidden when `immediateDanger`. |

## Rules

- **Rule 4**: reverse geocoding is server-side only. See `src/lib/getLocation.ts`,
  which proxies through the `reverse-geocode` edge function.
- **Privacy**: GPS / W3W / address lookups only run after explicit user opt-in.
- **Emergency number**: always rendered as `tel:` link.

## Import

```ts
import {
  EmergencyBanner,
  MyLocationPanel,
  ServiceCard,
  LocaleSelector,
  HelpNetworkHandoff,
} from "@/components/shared";
```
