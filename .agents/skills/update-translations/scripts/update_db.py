#!/usr/bin/env python3
"""Incrementally translate DB content (courses, lessons, quiz_questions).

Diffs current DB rows against .translation-manifest/db.json (MD5 per field) and only
translates changed fields. Writes per-language SQL files to /tmp/sql-update/{lang}.sql
which the agent applies via the supabase--insert tool.
"""
import json, os, sys, time, hashlib, subprocess, requests, concurrent.futures as cf, threading

API = "https://ai.gateway.lovable.dev/v1/chat/completions"
KEY = os.environ["LOVABLE_API_KEY"]
MODEL = os.environ.get("TRANSLATE_MODEL", "google/gemini-3-flash-preview")

LANG_NAMES = {
 'ar':'Arabic','bg':'Bulgarian','bn':'Bengali','cs':'Czech','da':'Danish','de':'German',
 'el':'Greek','es':'Spanish','et':'Estonian','fi':'Finnish','fr':'French','he':'Hebrew',
 'hr':'Croatian','hu':'Hungarian','id':'Indonesian','is':'Icelandic','it':'Italian','ja':'Japanese',
 'ko':'Korean','lt':'Lithuanian','lv':'Latvian','ms':'Malay','ne':'Nepali','nl':'Dutch',
 'no':'Norwegian','pa':'Punjabi','pl':'Polish','pt':'Portuguese','ro':'Romanian','si':'Sinhala',
 'sk':'Slovak','sl':'Slovenian','sr':'Serbian','sv':'Swedish','th':'Thai','tl':'Tagalog',
 'tr':'Turkish','uk':'Ukrainian','ur':'Urdu','vi':'Vietnamese','yue':'Cantonese','zh':'Chinese (Simplified)'
}

ROOT = os.getcwd()
MANIFEST_DIR = os.path.join(ROOT, '.translation-manifest')
MANIFEST = os.path.join(MANIFEST_DIR, 'db.json')
OUT_DIR = '/tmp/sql-update'
os.makedirs(MANIFEST_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

def md5(s): return hashlib.md5((s or '').encode('utf-8')).hexdigest()
def sqlesc(s): return 'NULL' if s is None else "'" + s.replace("'", "''") + "'"

def fetch():
    sql = ("SELECT json_build_object("
           "'courses',(SELECT json_agg(row_to_json(c)) FROM (SELECT id::text,title,summary,description FROM courses) c),"
           "'lessons',(SELECT json_agg(row_to_json(l)) FROM (SELECT id::text,title,body FROM lessons) l),"
           "'quiz',(SELECT json_agg(row_to_json(q)) FROM (SELECT id::text,question,choices,explanation FROM quiz_questions) q)"
           ");")
    out = subprocess.check_output(['psql','-A','-t','-c',sql]).decode()
    return json.loads(out)

src = fetch()
prev = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {"courses":{}, "lessons":{}, "quiz":{}}

COURSE_FIELDS = ['title','summary','description']
LESSON_FIELDS = ['title','body']
QUIZ_FIELDS   = ['question','choices','explanation']

def diff(kind, fields, rows):
    """Return list of (row_dict_with_changed_fields_only) and updated manifest section."""
    changed_rows = []
    new_manifest = {}
    for r in rows or []:
        rid = r['id']
        prev_row = prev.get(kind, {}).get(rid, {})
        cur_hashes = {}
        changed_fields = {}
        for f in fields:
            v = r.get(f)
            if f == 'choices':
                v_str = json.dumps(v if isinstance(v,list) else (json.loads(v) if v else []), ensure_ascii=False, sort_keys=True)
            else:
                v_str = v or ''
            h = md5(v_str)
            cur_hashes[f] = h
            if prev_row.get(f) != h:
                changed_fields[f] = v
        new_manifest[rid] = cur_hashes
        if changed_fields:
            entry = {'id': rid}
            entry.update(changed_fields)
            changed_rows.append(entry)
    return changed_rows, new_manifest

courses_chg, courses_mf = diff('courses', COURSE_FIELDS, src['courses'])
lessons_chg, lessons_mf = diff('lessons', LESSON_FIELDS, src['lessons'])
quiz_chg,    quiz_mf    = diff('quiz',    QUIZ_FIELDS,   src['quiz'])

print(f"DB diff: courses={len(courses_chg)}, lessons={len(lessons_chg)}, quiz={len(quiz_chg)}")
if not (courses_chg or lessons_chg or quiz_chg):
    print("DB: nothing to translate")
    sys.exit(0)

def call_ai(lang, kind, items, fields):
    name = LANG_NAMES[lang]
    sys_p = (f"You are a professional medical first-aid translator. Translate {kind} from English to {name}. "
             "PRESERVE EXACTLY: '000', 'Triple Zero', drug names + dosages, URLs, markdown, HTML tags, JSON keys, numbers. "
             "Return ALL items with same ids, same field set as input.")
    # Schema only includes the fields actually present in any item
    present = set()
    for it in items:
        for f in fields:
            if f in it: present.add(f)
    item_props = {"id":{"type":"string"}}
    for f in present:
        item_props[f] = {"type":"array","items":{"type":"string"}} if f=='choices' else {"type":"string"}
    item_schema = {"type":"object","properties":item_props,"required":["id"]+list(present),"additionalProperties":False}
    schema = {"type":"object","properties":{"items":{"type":"array","items":item_schema}},"required":["items"],"additionalProperties":False}
    # Normalise input
    payload = []
    for it in items:
        o = {"id": it['id']}
        for f in present:
            if f in it:
                v = it[f]
                o[f] = (v if isinstance(v,list) else (json.loads(v) if v else [])) if f=='choices' else (v or "")
        # fill missing required with empty
        for f in present:
            if f not in o:
                o[f] = [] if f=='choices' else ""
        payload.append(o)
    body = {"model":MODEL,
            "messages":[{"role":"system","content":sys_p},
                        {"role":"user","content":f"Translate to {name}:\n"+json.dumps(payload, ensure_ascii=False)}],
            "tools":[{"type":"function","function":{"name":"emit","parameters":schema}}],
            "tool_choice":{"type":"function","function":{"name":"emit"}}}
    for a in range(5):
        try:
            r = requests.post(API, headers={"Authorization":f"Bearer {KEY}","Content-Type":"application/json"},
                              json=body, timeout=240)
            if r.status_code in (429,503): time.sleep(10*(a+1)); continue
            r.raise_for_status()
            return json.loads(r.json()["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"])["items"]
        except Exception as e:
            if a == 4: print(f"  FAIL {lang}/{kind}: {e}"); return None
            time.sleep(5)

locks = {}
def lock(lang):
    if lang not in locks: locks[lang] = threading.Lock()
    return locks[lang]

def append(lang, lines):
    with lock(lang):
        open(f'{OUT_DIR}/{lang}.sql','a').write("\n".join(lines)+"\n")

def upsert_course(lang, it):
    # Build partial UPDATE — only include changed fields
    sets = []
    cols = ["course_id","lang","is_machine"]
    vals = [f"'{it['id']}'", f"'{lang}'", "true"]
    for f in ['title','summary','description']:
        if f in it:
            cols.append(f); vals.append(sqlesc(it.get(f) or ''))
            sets.append(f"{f}=EXCLUDED.{f}")
    # For required fields not in changed set, we still need title for INSERT — only insert if title in it OR row exists
    # Simplest: include all 3 fields, NULL for unchanged ones in the VALUES, but ON CONFLICT only update the changed ones.
    if 'title' not in it:
        cols.append('title'); vals.append("'(placeholder)'")
    return (f"INSERT INTO public.course_translations ({','.join(cols)}) VALUES ({','.join(vals)}) "
            f"ON CONFLICT (course_id,lang) DO UPDATE SET {','.join(sets)},is_machine=true,updated_at=now();")

def upsert_lesson(lang, it):
    sets = []
    cols = ["lesson_id","lang","is_machine"]
    vals = [f"'{it['id']}'", f"'{lang}'", "true"]
    for f in ['title','body']:
        if f in it:
            cols.append(f); vals.append(sqlesc(it.get(f) or ''))
            sets.append(f"{f}=EXCLUDED.{f}")
    if 'title' not in it:
        cols.append('title'); vals.append("'(placeholder)'")
    return (f"INSERT INTO public.lesson_translations ({','.join(cols)}) VALUES ({','.join(vals)}) "
            f"ON CONFLICT (lesson_id,lang) DO UPDATE SET {','.join(sets)},is_machine=true,updated_at=now();")

def upsert_quiz(lang, it):
    sets = []
    cols = ["question_id","lang","is_machine"]
    vals = [f"'{it['id']}'", f"'{lang}'", "true"]
    for f in ['question','choices','explanation']:
        if f in it:
            cols.append(f)
            if f == 'choices':
                vals.append(sqlesc(json.dumps(it.get(f) or [], ensure_ascii=False)) + '::jsonb')
            else:
                vals.append(sqlesc(it.get(f) or ''))
            sets.append(f"{f}=EXCLUDED.{f}")
    if 'question' not in it:
        cols.append('question'); vals.append("'(placeholder)'")
    if 'choices' not in it:
        cols.append('choices'); vals.append("'[]'::jsonb")
    return (f"INSERT INTO public.quiz_question_translations ({','.join(cols)}) VALUES ({','.join(vals)}) "
            f"ON CONFLICT (question_id,lang) DO UPDATE SET {','.join(sets)},is_machine=true,updated_at=now();")

LESSON_CHUNK = 4
QUIZ_CHUNK   = 15

def job(args):
    lang, kind, items = args
    if kind == 'course':
        res = call_ai(lang,'course overview', items, COURSE_FIELDS)
        if not res: return f"{lang}/course FAIL"
        # AI returns all requested fields — keep only the ones we asked to change
        merged = []
        for orig, tr in zip(items, res):
            m = {'id': orig['id']}
            for f in COURSE_FIELDS:
                if f in orig: m[f] = tr.get(f)
            merged.append(m)
        append(lang, [upsert_course(lang, m) for m in merged])
        return f"{lang}/course ok ({len(merged)})"
    if kind == 'lesson':
        res = call_ai(lang,'first aid lesson', items, LESSON_FIELDS)
        if not res: return f"{lang}/lesson FAIL"
        merged = []
        for orig, tr in zip(items, res):
            m = {'id': orig['id']}
            for f in LESSON_FIELDS:
                if f in orig: m[f] = tr.get(f)
            merged.append(m)
        append(lang, [upsert_lesson(lang, m) for m in merged])
        return f"{lang}/lesson ok ({len(merged)})"
    if kind == 'quiz':
        res = call_ai(lang,'quiz question', items, QUIZ_FIELDS)
        if not res: return f"{lang}/quiz FAIL"
        merged = []
        for orig, tr in zip(items, res):
            m = {'id': orig['id']}
            for f in QUIZ_FIELDS:
                if f in orig: m[f] = tr.get(f)
            merged.append(m)
        append(lang, [upsert_quiz(lang, m) for m in merged])
        return f"{lang}/quiz ok ({len(merged)})"

langs = sys.argv[1:] or list(LANG_NAMES.keys())
# Reset output files
for lang in langs: open(f'{OUT_DIR}/{lang}.sql','w').close()

jobs = []
for lang in langs:
    if courses_chg: jobs.append((lang, 'course', courses_chg))
    for i in range(0, len(lessons_chg), LESSON_CHUNK):
        jobs.append((lang, 'lesson', lessons_chg[i:i+LESSON_CHUNK]))
    for i in range(0, len(quiz_chg), QUIZ_CHUNK):
        jobs.append((lang, 'quiz', quiz_chg[i:i+QUIZ_CHUNK]))

print(f"Dispatching {len(jobs)} translation jobs across {len(langs)} languages")
done = 0
with cf.ThreadPoolExecutor(max_workers=24) as ex:
    for r in ex.map(job, jobs):
        done += 1
        if 'FAIL' in r or done % 20 == 0:
            print(f"[{done}/{len(jobs)}] {r}", flush=True)

# Update manifest
new_manifest = {"courses": courses_mf, "lessons": lessons_mf, "quiz": quiz_mf}
json.dump(new_manifest, open(MANIFEST,'w'), indent=2, sort_keys=True)
print(f"DB manifest updated → {MANIFEST}")
print(f"SQL files ready in {OUT_DIR}/  (apply via supabase--insert)")
