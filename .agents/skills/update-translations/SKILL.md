---
name: update-translations
description: Incrementally refresh translations for First Aid Angel. Detects what changed in the English UI catalog (src/locales/en.json) and the course/lesson/quiz DB content since the last run, and re-translates only the diff across all 42 supported languages via the Lovable AI Gateway. Trigger when the user says things like "update translations", "refresh translations", "translate what changed", "sync locales", or after editing en.json / lesson body / quiz text.
---

# Update Translations (incremental)

Refresh translations for **only what changed** since the last run. Never re-translates the whole catalog.

## Scope

Two surfaces:
1. **UI strings** — `src/locales/en.json` → `src/locales/{lang}.json` (42 target languages)
2. **DB content** — `courses`, `lessons`, `quiz_questions` → `course_translations`, `lesson_translations`, `quiz_question_translations`

Indigenous Australian languages (`arrernte`, `kriol`, `pitjantjatjara`, `tsi`, `yolngu`) get the English fallback with a `_todo` flag — never machine translation.

## Target languages (42)

`ar bg bn cs da de el es et fi fr he hr hu id is it ja ko lt lv ms ne nl no pa pl pt ro si sk sl sr sv th tl tr uk ur vi yue zh`

## How change detection works

A manifest file tracks an MD5 hash per source value. The runner re-translates only entries whose hash changed (or are new).

- **UI manifest:** `.translation-manifest/ui.json` — `{ "<key>": "<md5 of en value>" }`
- **DB manifest:** `.translation-manifest/db.json` — `{ "courses": {"<id>": {"title": "<hash>", "summary": "<hash>", "description": "<hash>"}}, "lessons": {...}, "quiz": {...} }`

If a manifest file is missing on first run, treat **everything as changed** (full bootstrap). After the run, write the updated manifest.

## Steps

1. **Verify environment.** `compgen -e | grep LOVABLE_API_KEY` must succeed. Confirm `psql` works (`test -n "$PGHOST"`).
2. **Run the UI updater:** copy `scripts/update_ui.py` to `/tmp/` and execute. It diffs `src/locales/en.json` against `.translation-manifest/ui.json`, calls the AI gateway in parallel for changed keys per language, merges into each `src/locales/{lang}.json`, and rewrites the manifest.
3. **Run the DB updater:** copy `scripts/update_db.py` to `/tmp/` and execute. It exports current `courses`/`lessons`/`quiz_questions` rows via `psql`, diffs against `.translation-manifest/db.json`, translates changed fields, and writes one SQL file per language to `/tmp/sql-update/`.
4. **Apply DB SQL.** For each non-empty file under `/tmp/sql-update/*.sql`, run it via the `supabase--insert` tool (one tool call per language). Each statement is an idempotent UPSERT on the translation tables.
5. **Report** the totals: keys updated per language, DB rows updated per language, and skipped indigenous languages.

## Conventions enforced by the scripts

- Model: `google/gemini-3-flash-preview` (override via `--model`).
- System prompt preserves: `000`, `Triple Zero`, medical drug names + dosages, URLs, markdown, HTML tags, JSON keys, placeholders like `{score}`, numbers.
- Tool-calling schema is generated per batch so output keys exactly match input keys.
- All translations are tagged `is_machine = true` / `_machine: true` in the locale file.
- UI catalog merges preserve any existing human-edited keys not in the diff.
- DB writes use `INSERT … ON CONFLICT (… , lang) DO UPDATE`.

## Outputs

- Updated `src/locales/{lang}.json` files
- Updated `.translation-manifest/ui.json` and `.translation-manifest/db.json`
- SQL files in `/tmp/sql-update/{lang}.sql` (the agent applies them)
- A summary line per language printed to stdout

## When NOT to use this skill

- First-time bulk translation of a brand new locale → use a full Phase-1/Phase-2 bootstrap instead (the manifest will then be created).
- Indigenous language human review → out of scope; this skill only flags them.
- Editing the source English copy → that's a normal code/DB edit; run this skill **afterwards** to propagate.
