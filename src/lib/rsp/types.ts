export type FAAEventType =
  | "kb_article_viewed"
  | "angel_action_viewed"
  | "symptom_lookup"
  | "aed_location_search"
  | "course_viewed"
  | "course_enrolment"
  | "kb_course_conversion"
  | "kb_program_conversion";

export interface FAASignal {
  site: string;
  help_stage: string;
  source_event_type: FAAEventType;
  theme: string | null;
  urgency: string;
  sensitivity_tier: number;
  suppression_active: boolean;
  location_language: string;
  location_country: string | null;
  session_id: string;
  created_at: string;
}
