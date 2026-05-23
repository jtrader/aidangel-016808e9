#!/usr/bin/env python3
"""Incrementally translate src/locales/en.json into all target languages.

Diffs current en.json against .translation-manifest/ui.json (MD5 per key) and only
re-translates changed/new keys. Indigenous languages get English fallback + _todo.
"""
import json, os, sys, time, hashlib, requests, concurrent.futures as cf

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
INDIGENOUS = ['arrernte','kriol','pitjantjatjara','tsi','yolngu']

ROOT = os.getcwd()
EN_PATH = os.path.join(ROOT, 'src/locales/en.json')
MANIFEST_DIR = os.path.join(ROOT, '.translation-manifest')
MANIFEST = os.path.join(MANIFEST_DIR, 'ui.json')

def md5(s): return hashlib.md5(s.encode('utf-8')).hexdigest()

en = json.load(open(EN_PATH))
os.makedirs(MANIFEST_DIR, exist_ok=True)
prev = json.load(open(MANIFEST)) if os.path.exists(MANIFEST) else {}

# Determine changed/new keys
changed = {k: v for k, v in en.items() if prev.get(k) != md5(v)}
removed = [k for k in prev if k not in en]
print(f"UI: {len(changed)} changed/new keys, {len(removed)} removed, {len(en)} total")
if not changed and not removed:
    print("UI: nothing to do"); sys.exit(0)

def call_ai(lang, items):
    name = LANG_NAMES[lang]
    sys_p = (f"You are a professional medical translator. Translate UI strings from English to {name}. "
             "PRESERVE EXACTLY: '000', 'Triple Zero', placeholders like {score}/{total}/{name}, "
             "URLs, markdown, HTML tags, and medical drug/dosage values.")
    schema = {"type":"object","properties":{k:{"type":"string"} for k in items},
              "required":list(items),"additionalProperties":False}
    body = {"model":MODEL,
            "messages":[{"role":"system","content":sys_p},
                        {"role":"user","content":"Translate these keys:\n"+json.dumps(items, ensure_ascii=False)}],
            "tools":[{"type":"function","function":{"name":"emit","parameters":schema}}],
            "tool_choice":{"type":"function","function":{"name":"emit"}}}
    for a in range(4):
        try:
            r = requests.post(API, headers={"Authorization":f"Bearer {KEY}","Content-Type":"application/json"},
                              json=body, timeout=180)
            if r.status_code in (429,503): time.sleep(8*(a+1)); continue
            r.raise_for_status()
            return json.loads(r.json()["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"])
        except Exception as e:
            if a == 3: print(f"  FAIL {lang}: {e}"); return None
            time.sleep(4)

def process(lang):
    path = os.path.join(ROOT, f'src/locales/{lang}.json')
    data = json.load(open(path)) if os.path.exists(path) else {}
    # remove deleted keys
    for k in removed: data.pop(k, None)
    if not changed:
        json.dump(data, open(path,'w'), ensure_ascii=False, indent=2)
        return f"{lang}: removed {len(removed)}"
    if lang in INDIGENOUS:
        for k, v in changed.items(): data[k] = v
        data['_todo'] = 'Needs human translation'
        json.dump(data, open(path,'w'), ensure_ascii=False, indent=2)
        return f"{lang}: english fallback ({len(changed)})"
    out = call_ai(lang, changed)
    if not out: return f"{lang}: FAIL"
    data.update(out); data['_machine'] = True
    json.dump(data, open(path,'w'), ensure_ascii=False, indent=2)
    return f"{lang}: ok ({len(out)})"

langs = sys.argv[1:] or sorted(list(LANG_NAMES.keys()) + INDIGENOUS)
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for r in ex.map(process, langs): print(r, flush=True)

# Update manifest
new_manifest = {k: md5(v) for k, v in en.items()}
json.dump(new_manifest, open(MANIFEST,'w'), indent=2, sort_keys=True)
print(f"UI manifest updated → {MANIFEST}")
