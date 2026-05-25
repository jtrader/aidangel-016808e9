
DO $$
DECLARE
  m record;
  block text;
  marker text;
BEGIN
  FOR m IN
    SELECT * FROM (VALUES
      ('recovery-drsabcd','drsabcd-walkthrough', ARRAY['danger-check','response-check','send-for-help','airway-open','breathing-check','cpr-essentials']),
      ('recovery-drsabcd','recovery-position', ARRAY['recovery-position']),
      ('recovery-drsabcd','spinal-precautions', ARRAY['spinal-inline-stabilization']),
      ('cpr-essentials','adult-cpr', ARRAY['cpr-essentials']),
      ('cpr-essentials','infant-cpr', ARRAY['infant-cpr-essentials']),
      ('cpr-essentials','aed-use', ARRAY['defib-pads']),
      ('aed-use','what-is-an-aed', ARRAY['aed-device-anatomy']),
      ('aed-use','pad-placement', ARRAY['defib-pads']),
      ('aed-use','aed-with-cpr', ARRAY['defib-pads-pediatric']),
      ('choking','recognising-choking', ARRAY['choking-airway']),
      ('choking','adult-child', ARRAY['choking-back-blows','choking-abdominal-thrusts']),
      ('choking','infant', ARRAY['infant-back-blows']),
      ('severe-bleeding','direct-pressure', ARRAY['severe-bleeding-pressure']),
      ('severe-bleeding','tourniquets', ARRAY['tourniquet-application']),
      ('severe-bleeding','shock', ARRAY['shock-management-blanket']),
      ('shock','what-to-do', ARRAY['shock-management-blanket']),
      ('burns-scalds','types-of-burns', ARRAY['burn-depth-layers']),
      ('burns-scalds','cool-cover', ARRAY['burns-cooling']),
      ('stroke-heart-attack','fast-test', ARRAY['stroke-face-check']),
      ('stroke-heart-attack','heart-attack-signs', ARRAY['heart-attack-pain-map']),
      ('anaphylaxis-allergies','epipen', ARRAY['anaphylaxis-injector']),
      ('anaphylaxis-allergies','positioning', ARRAY['anaphylaxis-positioning']),
      ('asthma','asthma-first-aid-plan-4-x-4-x-4', ARRAY['asthma-inhaler-spacer']),
      ('head-injuries-seizures','head-injury-first-aid', ARRAY['head-injury-cradle']),
      ('head-injuries-seizures','seizure-first-aid', ARRAY['seizure-protect-head']),
      ('heat-emergencies','heat-illness-first-aid', ARRAY['heat-cooling-active']),
      ('cold-emergencies','hypothermia-cold-stress', ARRAY['hypothermia-insulation']),
      ('cold-emergencies','frostbite-cold-injuries', ARRAY['frostbite-rewarming']),
      ('dehydration','what-to-do', ARRAY['dehydration-rehydration']),
      ('dental-injury','knocked-out-adult-tooth', ARRAY['dental-stabilization']),
      ('diabetes','hypoglycaemia-low-blood-sugar', ARRAY['diabetic-hypo-sugar']),
      ('drowning','what-to-do', ARRAY['drowning-airway-check']),
      ('electric-shock','safety-first', ARRAY['electric-shock-scene-warning']),
      ('eye-injuries','chemical', ARRAY['eye-injury-flushing']),
      ('fainting','what-to-do', ARRAY['fainting-leg-elevation']),
      ('fractures','what-to-do', ARRAY['fracture-splint-immobilise']),
      ('mental-health-first-aid','listen', ARRAY['mental-health-listening']),
      ('nosebleed','what-to-do', ARRAY['nosebleed-management']),
      ('poisoning','what-to-do', ARRAY['poisoning-container-check']),
      ('poisoning','button-battery', ARRAY['button-battery-warning']),
      ('bites-and-stings','snake-bites', ARRAY['snake-bite-bandage']),
      ('bites-and-stings','spider-bites', ARRAY['spider-bite-check']),
      ('bites-and-stings','marine-stings', ARRAY['marine-sting-vinegar']),
      ('spinal-injury','what-to-do', ARRAY['spinal-inline-stabilization']),
      ('sprains-strains','rice', ARRAY['sprain-compression-wrap']),
      ('sunburn','what-to-do', ARRAY['sunburn-soothe-cool'])
    ) AS t(course_slug, lesson_slug, keys)
  LOOP
    block := '';
    FOREACH marker IN ARRAY m.keys LOOP
      -- Only add if this specific directive isn't already present
      IF NOT EXISTS (
        SELECT 1 FROM lessons l
        JOIN courses c ON c.id = l.course_id
        WHERE c.slug = m.course_slug
          AND l.slug = m.lesson_slug
          AND l.body LIKE '%:::illustration[' || marker || ']%'
      ) THEN
        block := block || ':::illustration[' || marker || E']\n:::\n\n';
      END IF;
    END LOOP;

    IF length(block) > 0 THEN
      UPDATE lessons l
      SET body = block || COALESCE(l.body, ''),
          updated_at = now()
      FROM courses c
      WHERE c.id = l.course_id
        AND c.slug = m.course_slug
        AND l.slug = m.lesson_slug;
    END IF;
  END LOOP;
END $$;
