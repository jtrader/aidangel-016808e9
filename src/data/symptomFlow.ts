/**
 * Guided symptom-finder decision tree.
 * Source: St John Ambulance Australian First Aid 5th Edition + ARC Guidelines.
 *
 * Structure:
 *   - Questions: one question per node, each option leads to another question or a result.
 *   - Results: severity rating, emergency flag, ordered steps, do-not list, watch-for signs.
 */

export type Severity = "critical" | "urgent" | "moderate" | "low";

export type FlowOption = {
  label: string;
  /** id of next question, or null to use resultId */
  next: string | null;
  /** id of result when next is null */
  resultId?: string;
  /** pass-through to next question as context hint */
  hint?: string;
};

export type FlowQuestion = {
  id: string;
  question: string;
  subtext?: string;
  options: FlowOption[];
};

export type FlowResult = {
  id: string;
  severity: Severity;
  title: string;
  /** shown above steps */
  lead?: string;
  /** call-to-action: show emergency call button */
  callEmergency: boolean;
  /** shown inside the emergency CTA e.g. "Call 000 NOW — do this first" */
  callReason?: string;
  steps: string[];
  doNot?: string[];
  /** signs that mean the situation is worsening and they need to escalate */
  watchFor?: string[];
  /** slug of the KB article for "Read full guide" link */
  kbSlug?: string;
};

/* ─── Questions ──────────────────────────────────────────────── */

export const FLOW_QUESTIONS: FlowQuestion[] = [
  // ── Root ───────────────────────────────────────────────────────
  {
    id: "root",
    question: "What's the main emergency?",
    subtext: "Tap the option that best describes what's happening right now.",
    options: [
      { label: "Not breathing / no pulse",       next: "q-cpr-age",          hint: "cpr" },
      { label: "Choking",                         next: "q-choke-sound",      hint: "choke" },
      { label: "Severe bleeding",                 next: "q-bleed-where",      hint: "bleed" },
      { label: "Chest pain or pressure",          next: null, resultId: "chest-pain" },
      { label: "Allergic reaction",               next: "q-allergy-severe",   hint: "allergy" },
      { label: "Unconscious",                     next: "q-unconscious-breathing" },
      { label: "Seizure / fitting",               next: "q-seizure-active" },
      { label: "Stroke signs (FAST)",             next: null, resultId: "stroke" },
      { label: "Burns or scalds",                 next: "q-burn-severity" },
      { label: "Snake or spider bite",            next: "q-bite-type" },
      { label: "Asthma attack",                   next: null, resultId: "asthma" },
      { label: "Poisoning / overdose",            next: null, resultId: "poisoning" },
      { label: "Head injury / concussion",        next: "q-head-conscious" },
      { label: "Broken bone or sprain",           next: "q-fracture-deform" },
      { label: "Diabetic emergency",              next: null, resultId: "diabetic" },
      { label: "Something else",                  next: null, resultId: "general" },
    ],
  },

  // ── CPR branch ─────────────────────────────────────────────────
  {
    id: "q-cpr-age",
    question: "How old is the person?",
    options: [
      { label: "Adult (over 8 years)",  next: null, resultId: "cpr-adult" },
      { label: "Child (1–8 years)",     next: null, resultId: "cpr-child" },
      { label: "Infant (under 1 year)", next: null, resultId: "cpr-infant" },
    ],
  },

  // ── Choking branch ─────────────────────────────────────────────
  {
    id: "q-choke-sound",
    question: "Can the person cough or make any sound at all?",
    subtext: "If they can cough — even weakly — that means air is still moving.",
    options: [
      { label: "Yes — coughing or making sounds", next: null, resultId: "choking-mild" },
      { label: "No — silent, can't cough or speak", next: "q-choke-age" },
    ],
  },
  {
    id: "q-choke-age",
    question: "How old is the person who is choking?",
    options: [
      { label: "Adult or child (over 1 year)", next: null, resultId: "choking-severe" },
      { label: "Infant (under 1 year)",        next: null, resultId: "choking-infant" },
    ],
  },

  // ── Bleeding branch ────────────────────────────────────────────
  {
    id: "q-bleed-where",
    question: "Where is the wound?",
    options: [
      { label: "Limb (arm or leg)",              next: null, resultId: "bleeding-limb" },
      { label: "Chest, abdomen, neck or head",   next: null, resultId: "bleeding-torso" },
      { label: "Not sure / multiple wounds",     next: null, resultId: "bleeding-severe" },
    ],
  },

  // ── Allergic reaction branch ───────────────────────────────────
  {
    id: "q-allergy-severe",
    question: "Are any of these present?",
    subtext: "Signs of anaphylaxis (life-threatening allergic reaction).",
    options: [
      { label: "Swelling of face, tongue or throat", next: null, resultId: "anaphylaxis" },
      { label: "Difficulty breathing or wheezing",   next: null, resultId: "anaphylaxis" },
      { label: "Pale, floppy or loss of consciousness", next: null, resultId: "anaphylaxis" },
      { label: "Hives / rash only — breathing fine",    next: null, resultId: "allergy-mild" },
    ],
  },

  // ── Unconscious branch ─────────────────────────────────────────
  {
    id: "q-unconscious-breathing",
    question: "Is the person breathing?",
    subtext: "Look for chest rise and fall. Agonal gasping (irregular gurgling) is NOT normal breathing.",
    options: [
      { label: "Yes — breathing normally",       next: null, resultId: "recovery-position" },
      { label: "No / not sure / gasping only",   next: "q-cpr-age" },
    ],
  },

  // ── Seizure branch ─────────────────────────────────────────────
  {
    id: "q-seizure-active",
    question: "Is the seizure still happening right now?",
    options: [
      { label: "Yes — still seizing",      next: null, resultId: "seizure-active" },
      { label: "No — it has stopped",      next: null, resultId: "seizure-after" },
    ],
  },

  // ── Burns branch ───────────────────────────────────────────────
  {
    id: "q-burn-severity",
    question: "How large is the burn, or where is it?",
    options: [
      { label: "Larger than a 20-cent coin",            next: null, resultId: "burns-major" },
      { label: "On face, hands, feet or genitals",      next: null, resultId: "burns-major" },
      { label: "Chemical or electrical burn",           next: null, resultId: "burns-chemical" },
      { label: "Small burn — smaller than a 20-cent coin", next: null, resultId: "burns-minor" },
    ],
  },

  // ── Bites branch ───────────────────────────────────────────────
  {
    id: "q-bite-type",
    question: "What caused the bite?",
    options: [
      { label: "Snake",                                next: null, resultId: "snake-bite" },
      { label: "Funnel-web or mouse spider",           next: null, resultId: "spider-serious" },
      { label: "Redback spider",                       next: null, resultId: "spider-redback" },
      { label: "Other spider",                         next: null, resultId: "spider-other" },
      { label: "Jellyfish or marine creature",         next: "q-marine-type" },
    ],
  },
  {
    id: "q-marine-type",
    question: "What type of marine sting?",
    options: [
      { label: "Box jellyfish (tropical — north Australia)", next: null, resultId: "jellyfish-box" },
      { label: "Bluebottle or other jellyfish",              next: null, resultId: "jellyfish-bluebottle" },
      { label: "Stingray, stonefish or cone shell",          next: null, resultId: "marine-hot-water" },
      { label: "Blue-ringed octopus",                        next: null, resultId: "blue-ringed" },
    ],
  },

  // ── Head injury branch ─────────────────────────────────────────
  {
    id: "q-head-conscious",
    question: "Is the person conscious?",
    options: [
      { label: "Yes — awake and responding",  next: null, resultId: "head-injury-conscious" },
      { label: "No — unresponsive",           next: null, resultId: "head-injury-unconscious" },
    ],
  },

  // ── Fracture branch ────────────────────────────────────────────
  {
    id: "q-fracture-deform",
    question: "Is there obvious deformity, or is the bone possibly broken?",
    options: [
      { label: "Yes — bone looks deformed or likely broken", next: null, resultId: "fracture" },
      { label: "No — probably a sprain or strain",           next: null, resultId: "sprain" },
    ],
  },
];

/* ─── Results ────────────────────────────────────────────────── */

export const FLOW_RESULTS: FlowResult[] = [
  // ── CPR ────────────────────────────────────────────────────────
  {
    id: "cpr-adult",
    severity: "critical",
    title: "CPR — Adult (over 8 years)",
    lead: "Not breathing normally = start CPR immediately.",
    callEmergency: true,
    callReason: "Call 000 now — do this before or while starting CPR",
    steps: [
      "Check for danger — ensure the area is safe.",
      "Shout for help. Call 000 or send someone to call.",
      "Place the person on a firm, flat surface.",
      "Tilt head back, lift chin to open the airway.",
      "Look, listen and feel for breathing for no more than 10 seconds.",
      "Give 30 chest compressions: heel of hand on centre of chest, press down 5–6 cm at 100–120 per minute.",
      "Give 2 rescue breaths: pinch nose, seal lips, give a breath over 1 second, watch for chest rise.",
      "Continue 30 compressions : 2 breaths until the ambulance arrives or the person starts breathing.",
      "Use an AED as soon as one is available — turn it on and follow the voice prompts.",
    ],
    doNot: [
      "Do not stop CPR unless the person starts breathing or you are physically unable to continue.",
      "Do not give rescue breaths if you are unwilling — compression-only CPR is still effective.",
    ],
    watchFor: [
      "Return of normal breathing — place in recovery position if this happens.",
    ],
    kbSlug: "cpr",
  },
  {
    id: "cpr-child",
    severity: "critical",
    title: "CPR — Child (1–8 years)",
    lead: "Start CPR now. Give 5 rescue breaths first for children.",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Shout for help and call 000.",
      "Give 5 initial rescue breaths: tilt head back, cover mouth and nose, give 5 gentle puffs.",
      "Start 30 chest compressions with one or two hands in centre of chest, pressing down one-third of depth.",
      "Give 2 rescue breaths after every 30 compressions.",
      "Continue until ambulance arrives or child starts breathing normally.",
      "Attach AED as soon as available — use child pads if available.",
    ],
    doNot: [
      "Do not press as hard as for an adult — use one or two hands and aim for one-third chest depth.",
    ],
    kbSlug: "cpr",
  },
  {
    id: "cpr-infant",
    severity: "critical",
    title: "CPR — Infant (under 1 year)",
    lead: "Give 5 initial rescue breaths, then 30:2 CPR.",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Shout for help — send someone to call 000 while you start.",
      "Lay infant on a firm surface.",
      "Tilt head to neutral (sniffing) position — do not over-extend.",
      "Cover the infant's mouth AND nose with your mouth; give 5 gentle puffs.",
      "Place 2 fingers on centre of chest (just below nipple line); press down one-third of chest depth.",
      "Do 30 compressions at 100–120 per minute, then 2 puffs of air.",
      "Continue 30:2 until ambulance arrives.",
    ],
    kbSlug: "cpr",
  },

  // ── Choking ────────────────────────────────────────────────────
  {
    id: "choking-mild",
    severity: "urgent",
    title: "Choking — partial obstruction",
    lead: "Air is still moving. Encourage them to keep coughing hard.",
    callEmergency: false,
    steps: [
      "Encourage forceful coughing — it is the most effective way to clear the airway.",
      "Do NOT slap their back while they can still cough effectively.",
      "Stay with them and watch closely.",
      "If the coughing stops and they can no longer breathe, speak, or cry — escalate immediately to back blows.",
      "Call 000 if breathing worsens at any point.",
    ],
    watchFor: ["Coughing stops", "Skin turns blue", "Person becomes limp"],
    kbSlug: "choking",
  },
  {
    id: "choking-severe",
    severity: "critical",
    title: "Choking — complete blockage (adult or child)",
    lead: "Airway is blocked. Act immediately.",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Call 000 immediately or have someone call.",
      "Lean the person forward. Give 5 firm back blows between the shoulder blades with the heel of your hand.",
      "After each blow, check if the obstruction has cleared.",
      "If not cleared after 5 blows, give 5 chest thrusts: stand behind, place hands in CPR position on chest, give 5 sharp inward thrusts.",
      "Keep alternating 5 back blows + 5 chest thrusts until the object is cleared or they lose consciousness.",
      "If they become unconscious: lower to the ground, start CPR — compressions may dislodge the object.",
    ],
    doNot: [
      "Do not perform abdominal thrusts (Heimlich) — Australian guidelines use chest thrusts.",
      "Do not do blind finger sweeps — only remove an object you can clearly see.",
    ],
    kbSlug: "choking",
  },
  {
    id: "choking-infant",
    severity: "critical",
    title: "Choking — infant (under 1 year)",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Call 000 immediately.",
      "Hold the infant face-down on your forearm, supporting the head.",
      "Give 5 firm back blows between the shoulder blades with 2 fingers.",
      "Turn infant face-up on your arm. Give 5 chest thrusts with 2 fingers on centre of chest.",
      "Alternate 5 back blows + 5 chest thrusts until object clears or infant loses consciousness.",
      "If unconscious: start infant CPR.",
    ],
    doNot: [
      "Do not hold the infant upside down — lay on forearm instead.",
      "Do not do blind finger sweeps.",
    ],
    kbSlug: "choking",
  },

  // ── Bleeding ───────────────────────────────────────────────────
  {
    id: "bleeding-limb",
    severity: "urgent",
    title: "Severe bleeding — limb wound",
    callEmergency: true,
    callReason: "Call 000 if bleeding is heavy or won't stop",
    steps: [
      "Call 000 if blood is spurting, pumping, or heavy.",
      "Press firmly on the wound with a clean cloth, dressing or your hand.",
      "Keep pressing — do not remove the first pad. Add more padding if it soaks through.",
      "Elevate the limb above the level of the heart if possible.",
      "If firm pressure does not stop the bleeding, apply a tourniquet 5–7 cm above the wound. Note the time.",
      "Keep the person warm and lying down until the ambulance arrives.",
    ],
    doNot: [
      "Do not remove the first pad — add on top.",
      "Do not remove an embedded object — press around it.",
      "Do not give food or drink.",
    ],
    watchFor: ["Pale, clammy skin", "Rapid weak pulse", "Confusion or drowsiness (signs of shock)"],
    kbSlug: "bleeding",
  },
  {
    id: "bleeding-torso",
    severity: "critical",
    title: "Severe bleeding — chest, abdomen or neck",
    lead: "Torso wounds are life-threatening. Call 000 immediately.",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Call 000 immediately.",
      "Apply firm direct pressure with a clean pad — and keep pressing.",
      "Do NOT remove an embedded object — pad around it.",
      "For a chest wound: if air is sucking in through the wound, cover with a gloved hand or airtight dressing.",
      "Lie the person down and keep them still.",
      "Monitor breathing and be prepared to start CPR.",
    ],
    doNot: [
      "Do not remove any embedded objects.",
      "Do not give food, water or medications.",
    ],
    kbSlug: "bleeding",
  },
  {
    id: "bleeding-severe",
    severity: "critical",
    title: "Severe bleeding — multiple or unclear wounds",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Call 000 now.",
      "Apply firm pressure to all visible wounds with clean pads.",
      "Lay the person down; raise legs if no suspected spinal or lower-body injury.",
      "Keep applying pressure and add more pads over any soaked dressings.",
      "Keep the person warm and still.",
      "Monitor breathing — be ready to start CPR.",
    ],
    doNot: ["Do not remove embedded objects.", "Do not give food or drink."],
    kbSlug: "bleeding",
  },

  // ── Chest pain ─────────────────────────────────────────────────
  {
    id: "chest-pain",
    severity: "critical",
    title: "Chest pain — suspected heart attack",
    lead: "Chest pain + any additional symptoms = treat as a heart attack until proven otherwise.",
    callEmergency: true,
    callReason: "Call 000 immediately — do not drive to hospital",
    steps: [
      "Call 000 now.",
      "Sit the person down and rest — do not let them walk.",
      "Loosen tight clothing.",
      "If not allergic to aspirin, not under 18, and not bleeding: give one 300 mg aspirin tablet to chew slowly.",
      "If they have prescribed GTN (nitroglycerin) spray/tablets, help them take it.",
      "Stay with them and keep them calm until the ambulance arrives.",
      "If they become unresponsive and stop breathing normally: start CPR and use an AED if available.",
    ],
    doNot: [
      "Do not let them walk or exert themselves.",
      "Do not give aspirin if they are allergic, under 18, or actively bleeding.",
      "Do not drive them to hospital — the ambulance can start treatment immediately.",
    ],
    watchFor: ["Loss of consciousness", "Stops breathing"],
    kbSlug: "heart-attack",
  },

  // ── Anaphylaxis ────────────────────────────────────────────────
  {
    id: "anaphylaxis",
    severity: "critical",
    title: "Anaphylaxis — severe allergic reaction",
    lead: "Anaphylaxis can be fatal within minutes. Use adrenaline first.",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Call 000 immediately.",
      "Use adrenaline autoinjector (EpiPen) immediately — outer thigh, through clothing if needed.",
      "Lay the person flat with legs raised (unless breathing difficulty — then allow sitting up).",
      "If no improvement after 5 minutes, give a second dose if available.",
      "If they become unconscious and are not breathing, start CPR.",
      "Stay with them — anaphylaxis can recur even after apparent recovery.",
    ],
    doNot: [
      "Do not stand the person up — they can collapse suddenly.",
      "Do not delay adrenaline while waiting for an ambulance.",
    ],
    watchFor: ["Second reaction 1–8 hours later (biphasic reaction)"],
    kbSlug: "anaphylaxis",
  },
  {
    id: "allergy-mild",
    severity: "moderate",
    title: "Mild to moderate allergic reaction",
    callEmergency: false,
    steps: [
      "Remove or avoid the allergen if identified.",
      "If prescribed: give antihistamine as directed.",
      "If prescribed: use asthma reliever puffer if there is any wheeze.",
      "Watch closely for signs of worsening — swelling of face/throat, difficulty breathing.",
      "Seek medical review — a GP visit is recommended even for mild reactions.",
    ],
    watchFor: ["Swelling spreading to face or throat", "Any breathing difficulty — if this occurs, call 000 immediately."],
    kbSlug: "allergic-reactions",
  },

  // ── Recovery position ──────────────────────────────────────────
  {
    id: "recovery-position",
    severity: "urgent",
    title: "Unconscious but breathing — recovery position",
    callEmergency: true,
    callReason: "Call 000 now — unconsciousness always needs assessment",
    steps: [
      "Call 000 immediately.",
      "Extend the far arm out from the body.",
      "Place the near arm across the chest.",
      "Bend the near leg at the knee.",
      "Roll the person onto their side (away from you), keeping the head supported.",
      "Tilt the head back slightly and open the mouth downward to allow fluid to drain.",
      "Monitor breathing continuously until help arrives.",
    ],
    doNot: [
      "Do not leave them alone.",
      "Do not give food, water or medication while unconscious.",
    ],
    watchFor: ["Breathing stops — start CPR immediately."],
    kbSlug: "recovery-position",
  },

  // ── Seizure ────────────────────────────────────────────────────
  {
    id: "seizure-active",
    severity: "urgent",
    title: "Seizure — in progress",
    callEmergency: true,
    callReason: "Call 000 if this is their first seizure, if it lasts over 5 minutes, or if they don't recover",
    steps: [
      "Protect them from injury — clear the area, pad the head with a soft item.",
      "Time the seizure from when it started.",
      "Do not restrain them — let the seizure run its course.",
      "Call 000 if: first-ever seizure, lasts more than 5 minutes, they don't wake up within 5 minutes after, or they are pregnant, diabetic, or injured.",
      "Once the convulsions stop, place in the recovery position.",
      "Stay with them and reassure them when they wake — confusion after a seizure is normal.",
    ],
    doNot: [
      "Do not restrain or hold them down.",
      "Do not put anything in their mouth.",
      "Do not give food or water until fully alert.",
    ],
    watchFor: ["Second seizure", "Not waking up within 5 minutes after seizure stops"],
    kbSlug: "seizures",
  },
  {
    id: "seizure-after",
    severity: "moderate",
    title: "Seizure — has stopped",
    callEmergency: false,
    steps: [
      "Place in recovery position if unconscious or semi-conscious.",
      "Stay with them — confusion and sleepiness for up to 30 minutes after is normal (postictal phase).",
      "Check for injuries sustained during the seizure.",
      "Call 000 if: first-ever seizure, seizure lasted more than 5 minutes, they don't recover, or they are injured.",
      "They should see a doctor even if they have an existing diagnosis.",
    ],
    watchFor: ["Second seizure", "Prolonged unconsciousness"],
    kbSlug: "seizures",
  },

  // ── Stroke ─────────────────────────────────────────────────────
  {
    id: "stroke",
    severity: "critical",
    title: "Stroke — use the FAST test",
    lead: "Every minute counts. Time lost = brain lost.",
    callEmergency: true,
    callReason: "Call 000 immediately — stroke is a medical emergency",
    steps: [
      "F — Face: Ask them to smile. Is one side drooping?",
      "A — Arms: Can they raise both arms? Does one drift down?",
      "S — Speech: Is their speech slurred or strange?",
      "T — Time: If any of those are YES — call 000 now. Note the time symptoms started.",
      "Lie them down with head and shoulders slightly raised.",
      "Do not give food or drink.",
      "If unconscious: recovery position and monitor breathing.",
    ],
    doNot: [
      "Do not give aspirin for a suspected stroke — it can worsen some types of stroke.",
      "Do not give food or water.",
    ],
    watchFor: ["Loss of consciousness", "Breathing stops"],
    kbSlug: "stroke",
  },

  // ── Burns ──────────────────────────────────────────────────────
  {
    id: "burns-major",
    severity: "urgent",
    title: "Major burn — needs hospital",
    callEmergency: true,
    callReason: "Call 000 for large burns, burns on face/hands/feet, or if the person is a child",
    steps: [
      "Call 000 for large or serious burns.",
      "Cool the burn under cool (not cold) running water for at least 20 minutes — start this immediately.",
      "Remove clothing and jewellery from the burn area — unless stuck to the skin.",
      "Cover loosely with cling wrap or a clean non-fluffy dressing.",
      "Keep the person warm — cooling a burn is important but don't let them get cold overall.",
      "Do not give food or drink if a serious burn (possible surgery needed).",
    ],
    doNot: [
      "Do not use ice, icy water, or ice packs — this can deepen the burn.",
      "Do not apply butter, toothpaste, lotions or creams.",
      "Do not burst blisters.",
      "Do not remove clothing stuck to the burn.",
    ],
    watchFor: ["Signs of shock (pale, clammy, confused)"],
    kbSlug: "burns",
  },
  {
    id: "burns-chemical",
    severity: "urgent",
    title: "Chemical or electrical burn",
    callEmergency: true,
    callReason: "Call 000 for electrical burns or large chemical burns",
    steps: [
      "For electrical burns: do not touch the person until the power is off. Call 000.",
      "For chemical burns: brush off any dry chemical, then flush with large amounts of cool water for at least 20 minutes.",
      "Remove contaminated clothing (protect yourself — wear gloves if available).",
      "Cover loosely with cling wrap.",
      "All electrical burns and significant chemical burns require hospital assessment.",
    ],
    doNot: [
      "Do not touch an electrical burn victim until the power source is confirmed off.",
      "Do not neutralise chemicals with other chemicals.",
    ],
    kbSlug: "burns",
  },
  {
    id: "burns-minor",
    severity: "low",
    title: "Minor burn",
    callEmergency: false,
    steps: [
      "Cool under cool (not cold) running water for at least 20 minutes.",
      "Remove jewellery or clothing near the burn area.",
      "Cover loosely with cling wrap or a non-fluffy clean dressing.",
      "Take simple pain relief (paracetamol or ibuprofen) if needed.",
      "Seek medical care if blisters form, the burn is on the face/hands/feet/genitals, or worsens.",
    ],
    doNot: [
      "Do not apply ice, butter or creams.",
      "Do not burst blisters.",
    ],
    kbSlug: "burns",
  },

  // ── Snake & spider bites ───────────────────────────────────────
  {
    id: "snake-bite",
    severity: "critical",
    title: "Snake bite",
    callEmergency: true,
    callReason: "Call 000 immediately — even if they feel well now",
    steps: [
      "Call 000 immediately.",
      "Keep the person absolutely still and calm — movement spreads venom faster.",
      "Apply a pressure immobilisation bandage: start at the bite, bandage firmly all the way up the entire limb.",
      "Splint the limb to prevent movement.",
      "Mark the time of the bite and bandage on the skin.",
      "Do not let the person walk — carry them or wait for help.",
    ],
    doNot: [
      "Do not wash the bite — venom on skin is used to identify the snake species.",
      "Do not cut, suck or tourniquet the bite.",
      "Do not remove the bandage once applied.",
    ],
    kbSlug: "snake-bite",
  },
  {
    id: "spider-serious",
    severity: "critical",
    title: "Funnel-web or mouse spider bite",
    lead: "Funnel-web spider venom acts quickly and can be fatal.",
    callEmergency: true,
    callReason: "Call 000 immediately",
    steps: [
      "Call 000 immediately.",
      "Apply pressure immobilisation bandage (same technique as snake bite) and splint the limb.",
      "Keep the person still and calm.",
      "Note the time of the bite.",
    ],
    doNot: ["Do not wash the bite.", "Do not remove the bandage."],
    kbSlug: "spider-bites",
  },
  {
    id: "spider-redback",
    severity: "urgent",
    title: "Redback spider bite",
    callEmergency: false,
    steps: [
      "Do NOT apply a pressure bandage for redback — it increases pain without benefit.",
      "Apply a cold pack or ice pack (wrapped) to the bite site.",
      "Seek medical attention — antivenom is available and most people need hospital treatment.",
      "Call 000 or go to ED if severe pain, sweating, vomiting, or muscle weakness develop.",
    ],
    doNot: [
      "Do not apply a pressure immobilisation bandage.",
    ],
    watchFor: ["Severe pain spreading", "Sweating, nausea, muscle weakness"],
    kbSlug: "spider-bites",
  },
  {
    id: "spider-other",
    severity: "low",
    title: "Other spider bite",
    callEmergency: false,
    steps: [
      "Apply a cold pack or ice pack (wrapped) to reduce pain and swelling.",
      "Watch for signs of worsening reaction over the next few hours.",
      "Seek medical care if: symptoms worsen, spreading redness, nausea, pain or swelling.",
    ],
    watchFor: ["Spreading redness", "Nausea", "Significant swelling"],
    kbSlug: "spider-bites",
  },

  // ── Marine stings ──────────────────────────────────────────────
  {
    id: "jellyfish-box",
    severity: "critical",
    title: "Box jellyfish sting",
    callEmergency: true,
    callReason: "Call 000 immediately — box jellyfish venom is potentially fatal",
    steps: [
      "Call 000 immediately.",
      "Remove the person from the water.",
      "Flood the sting with vinegar for at least 30 seconds to deactivate tentacles.",
      "Do not rub the skin.",
      "Carefully remove tentacles with tweezers or a gloved hand (not bare hands).",
      "Be prepared to start CPR if they become unconscious.",
    ],
    doNot: ["Do not rub the sting area.", "Do not use fresh water or urine on a box jellyfish sting."],
    kbSlug: "jellyfish-stings",
  },
  {
    id: "jellyfish-bluebottle",
    severity: "moderate",
    title: "Bluebottle (Portuguese Man O' War) sting",
    callEmergency: false,
    steps: [
      "Remove visible tentacles carefully (avoid bare hands).",
      "Immerse the affected area in hot water (as hot as tolerable without scalding) for 20 minutes.",
      "If hot water is unavailable, apply a cold pack.",
      "Take pain relief (paracetamol or ibuprofen) if needed.",
      "Seek medical care if symptoms are severe or do not improve.",
    ],
    doNot: ["Do not use vinegar on a bluebottle sting — it can worsen the reaction."],
    kbSlug: "jellyfish-stings",
  },
  {
    id: "marine-hot-water",
    severity: "urgent",
    title: "Stingray, stonefish or cone shell",
    callEmergency: true,
    callReason: "Call 000 for stonefish or cone shell; seek urgent medical care for stingray",
    steps: [
      "Immerse the affected limb in hot water (as hot as the person can tolerate, without scalding) for up to 90 minutes — hot water inactivates the venom.",
      "Call 000 for stonefish or cone shell sting.",
      "Remove any visible spine (if safe to do so).",
      "Monitor for signs of shock or breathing difficulty.",
    ],
    doNot: ["Do not apply a pressure bandage for marine stings (except blue-ringed octopus)."],
    kbSlug: "jellyfish-stings",
  },
  {
    id: "blue-ringed",
    severity: "critical",
    title: "Blue-ringed octopus bite",
    callEmergency: true,
    callReason: "Call 000 immediately — venom causes paralysis, victim may need breathing support",
    steps: [
      "Call 000 immediately.",
      "Apply pressure immobilisation bandage and splint the limb.",
      "Monitor breathing closely — venom causes respiratory paralysis.",
      "Be prepared to give rescue breaths or start CPR if breathing stops.",
    ],
    doNot: ["Do not remove the bandage."],
    kbSlug: "jellyfish-stings",
  },

  // ── Asthma ─────────────────────────────────────────────────────
  {
    id: "asthma",
    severity: "urgent",
    title: "Asthma attack",
    callEmergency: false,
    lead: "Call 000 if the reliever puffer has no effect after 4 minutes.",
    steps: [
      "Sit the person upright and stay calm.",
      "Give 4 puffs of blue/grey reliever (Ventolin/Bricanyl) via spacer — one puff at a time, 4 breaths each.",
      "Wait 4 minutes.",
      "If no improvement: give 4 more puffs.",
      "If still no improvement after 8 puffs: call 000.",
      "Continue giving 4 puffs every 4 minutes until the ambulance arrives.",
    ],
    doNot: [
      "Do not give a preventer (brown/purple/orange) puffer during an attack — use the blue/grey reliever.",
      "Do not lay them flat.",
    ],
    watchFor: ["Not improving after second round of puffs", "Lips turning blue"],
    kbSlug: "asthma",
  },

  // ── Poisoning ──────────────────────────────────────────────────
  {
    id: "poisoning",
    severity: "urgent",
    title: "Suspected poisoning or overdose",
    callEmergency: true,
    callReason: "Call 13 11 26 (Poisons Information) or 000 if unconscious",
    steps: [
      "Call the Poisons Information Centre: 13 11 26 (Australia, 24/7).",
      "Call 000 immediately if the person is unconscious, not breathing, or having a seizure.",
      "If conscious, keep them calm and still.",
      "Do NOT induce vomiting unless specifically instructed by the Poisons Centre.",
      "Keep the container, label, plant, or substance for identification — have it ready for the call.",
      "If unconscious and breathing: recovery position.",
    ],
    doNot: [
      "Do not give food, water or milk unless instructed.",
      "Do not induce vomiting unless the Poisons Centre tells you to.",
    ],
    kbSlug: "poisoning",
  },

  // ── Head injury ────────────────────────────────────────────────
  {
    id: "head-injury-conscious",
    severity: "urgent",
    title: "Head injury — conscious",
    callEmergency: false,
    lead: "All significant head knocks require medical review.",
    steps: [
      "Lay the person down with head and shoulders slightly raised.",
      "Control any bleeding with gentle direct pressure.",
      "Do not move them if you suspect a spinal injury — support the head and neck.",
      "Call 000 or take to ED if: loss of consciousness (even brief), confusion, repeated vomiting, persistent headache, unequal pupils, or suspected spinal injury.",
      "Do not leave them alone for at least 4 hours.",
    ],
    doNot: [
      "Do not give aspirin or ibuprofen — use paracetamol only for pain if needed.",
      "Do not let them return to sport or activity before medical clearance.",
    ],
    watchFor: [
      "Confusion or unusual behaviour",
      "Repeated vomiting",
      "Increasing headache",
      "Drowsiness that cannot be roused",
      "Unequal pupils",
    ],
    kbSlug: "head-injury",
  },
  {
    id: "head-injury-unconscious",
    severity: "critical",
    title: "Head injury — unconscious",
    callEmergency: true,
    callReason: "Call 000 now",
    steps: [
      "Call 000 immediately.",
      "Assume spinal injury — do not move them unless in immediate danger.",
      "Support the head and neck in the position found.",
      "Check breathing — if breathing: maintain position and monitor.",
      "If not breathing normally: start CPR (the risk of brain injury outweighs spinal risk).",
    ],
    doNot: [
      "Do not move the head or neck unless absolutely necessary.",
    ],
    watchFor: ["Breathing stops — start CPR immediately."],
    kbSlug: "head-injury",
  },

  // ── Fracture / Sprain ──────────────────────────────────────────
  {
    id: "fracture",
    severity: "moderate",
    title: "Suspected broken bone (fracture)",
    callEmergency: false,
    lead: "Call 000 for spinal injuries, open fractures with bone showing, or if in a remote location.",
    steps: [
      "Keep the person still — do not try to straighten the injury.",
      "Support the injured limb in the position found with padding, a rolled blanket or triangular bandage.",
      "Apply ice (wrapped in cloth) to reduce swelling.",
      "Check circulation below the injury every 15 minutes (colour, warmth, sensation).",
      "Call 000 or go to ED for assessment and X-ray.",
      "If an open fracture (bone visible): cover with a clean dressing, call 000.",
    ],
    doNot: [
      "Do not try to realign or straighten the bone.",
      "Do not give food or drink if surgery may be needed.",
    ],
    kbSlug: "fractures",
  },
  {
    id: "sprain",
    severity: "low",
    title: "Sprain or strain — RICE method",
    callEmergency: false,
    steps: [
      "R — Rest: stop activity and avoid weight-bearing.",
      "I — Ice: apply an ice pack (wrapped in cloth) for 20 minutes every 2 hours for 24–48 hours.",
      "C — Compression: apply a firm bandage from below the injury upward.",
      "E — Elevate: raise the injured part above the level of the heart.",
      "Take paracetamol or ibuprofen for pain relief if needed.",
      "Seek medical review if no improvement in 48 hours, or if you suspect a fracture.",
    ],
    doNot: [
      "Do not apply heat in the first 48 hours.",
      "Do not continue activity — rest is essential.",
    ],
    kbSlug: "sprains-strains",
  },

  // ── Diabetic emergency ─────────────────────────────────────────
  {
    id: "diabetic",
    severity: "urgent",
    title: "Diabetic emergency — low blood sugar (hypo)",
    callEmergency: false,
    lead: "If in doubt between hypo and hyper, treat as hypo — giving sugar won't harm someone with high sugar.",
    steps: [
      "If conscious and able to swallow: give fast-acting sugar — half a glass of fruit juice, regular soft drink (not diet), or 3–4 jelly beans.",
      "Wait 15 minutes. If no improvement, repeat.",
      "Once improved, give a longer-acting snack (e.g. sandwich, biscuits).",
      "Call 000 if: unconscious, unable to swallow, no improvement after two doses of sugar, or you're unsure.",
    ],
    doNot: [
      "Do not give anything by mouth to an unconscious person.",
    ],
    watchFor: ["Deteriorating consciousness — call 000 immediately if this occurs."],
    kbSlug: "diabetes",
  },

  // ── General fallback ───────────────────────────────────────────
  {
    id: "general",
    severity: "low",
    title: "Need more help?",
    callEmergency: false,
    lead: "Use the full Knowledge Base to find guidance for your situation.",
    steps: [
      "Search the First Aid Knowledge Base for your specific situation.",
      "For any life-threatening emergency, call 000 immediately.",
      "For poisoning: call the Poisons Information Centre on 13 11 26.",
      "For 24/7 nurse advice: call Healthdirect on 1800 022 222.",
    ],
    kbSlug: undefined,
  },
];

/* ─── Helpers ────────────────────────────────────────────────── */

export function getQuestion(id: string): FlowQuestion | undefined {
  return FLOW_QUESTIONS.find((q) => q.id === id);
}

export function getResult(id: string): FlowResult | undefined {
  return FLOW_RESULTS.find((r) => r.id === id);
}

export const SEVERITY_CONFIG: Record<Severity, { label: string; className: string }> = {
  critical: { label: "CRITICAL — act now",    className: "bg-destructive text-destructive-foreground" },
  urgent:   { label: "URGENT",                className: "bg-orange-500 text-white" },
  moderate: { label: "MODERATE",              className: "bg-yellow-500 text-white" },
  low:      { label: "LOW RISK",              className: "bg-green-600 text-white" },
};
