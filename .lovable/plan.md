# Free Courses + Paid CPD Certificates

All First Aid Angel courses become **free for everyone**. Users are only charged on completion when they want to download a CPD-compliant certificate. Bulk plans stay, rebranded from "licences/seats" → "certificate credits".

## 1. Paddle catalog

Add one new product:
- **`certificate_single`** — AU$29 one-off, qty 1 (the standalone post-completion purchase)

Keep all existing products at current prices, rebranded as credit packs (no price changes — Paddle entities stay valid):

| price_id | Price | Credits granted |
|---|---|---|
| `certificate_single` | AU$29 | 1 |
| `personal_individual_annual` | AU$25 | 1 (intro saver) |
| `personal_family_annual` | AU$60 | 3 |
| `personal_family_plus_annual` | AU$90 | 5 |
| `employer_starter_seat_annual` | AU$29/seat | quantity × 1 |
| `employer_team_25_annual` | AU$625 | 25 |
| `employer_team_50_annual` | AU$1,250 | 50 |
| `employer_workplace_annual` | AU$1,500 | Unlimited (9999) |

## 2. Database

New table `public.certificate_credits`:
- `user_id uuid PK references auth.users`
- `balance int not null default 0`
- `unlimited boolean default false` (for Workplace tier)
- `environment text default 'live'`
- `updated_at timestamptz`
- RLS: user can SELECT own row; service_role manages writes
- Helper: `consume_certificate_credit(_user uuid)` SECURITY DEFINER → returns boolean (decrements or no-op if unlimited; raises on insufficient)

Migration grants credits to existing subscribers based on their active `subscriptions` rows using the table above.

## 3. Webhook (`payments-webhook`)

In `handleSubscriptionCreated` / `transaction.completed`, derive credits from `price.importMeta.externalId` × quantity, then upsert into `certificate_credits` (add to existing balance, or flip `unlimited=true` for workplace). Both sandbox and live granted; the `environment` column scopes them.

## 4. Course completion → certificate paywall

`ProgramCertificate.tsx`:
- If `cert` already exists → show download as today
- If not → fetch credit balance:
  - **balance > 0 or unlimited** → "Use 1 credit & issue certificate" button → calls `consume_certificate_credit` then inserts cert
  - **balance = 0** → "Purchase CPD certificate — AU$29" button → opens Paddle checkout for `certificate_single`, returns to same page
- Also a "Buy a credit pack" link to `/personal`

`CourseQuiz.tsx`: after a passing attempt, add a "Download your CPD certificate" CTA pointing to the program cert page (or single-topic cert if applicable — kept simple: links to `/programs` to find their program).

## 5. Marketing copy

`PersonalMarketing.tsx`:
- New hero: "All First Aid courses are free. Pay only for your CPD certificate."
- Replace pricing intro: "Skip-ahead packs of CPD certificate credits"
- Tier `seats` → "1 certificate credit" / "3 credits" / "5 credits"
- Update FEATURES bullet about certificate to reflect $29 pay-on-completion
- Top of pricing section: callout "Or pay AU$29 per certificate as you go — no plan needed."

`EmployerMarketing.tsx`:
- Hero subtitle: "All courses free for your whole team. Buy CPD certificate credits in bulk and assign them when learners pass."
- Tier labels: "10 certificate credits", "25 credits", "50 credits", "Unlimited certificates / year"
- Replace "seats" copy throughout

## 6. Memory

Update `mem://features/payments` with new model (certificate_single + credit semantics).

## Technical notes

- No backend/types files edited (`integrations/supabase/*` auto-generated).
- Credit consumption is atomic via SECURITY DEFINER function with row-lock to prevent double-issue.
- Workplace `unlimited=true` short-circuits balance checks.
- Existing subs already in `subscriptions` table get a one-time grant via migration `INSERT … SELECT` mapping the same `price_id → credits` table above.
- Test mode: credits granted from sandbox checkouts are scoped by `environment` and only count in preview; live published app reads `environment='live'`.

## Out of scope (this pass)

- Per-language i18n strings for new copy (English only updated; other locales fall back).
- Refactoring the `/programs` quiz flow vs `/topics` quiz flow — keep current routing.
- Admin UI to manually grant/revoke credits.