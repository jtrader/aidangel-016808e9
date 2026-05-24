interface HypothermiaInsulationProps {
  className?: string;
  title?: string;
}

/**
 * HypothermiaInsulation — a patient securely wrapped inside a multi-layered
 * thermal enclosure blanket. An emergency red base floor pad rail underneath
 * the body emphasises insulation from the cold ground, paired with stylised
 * red thermal lock arrows pointing inward to symbolise body heat containment.
 *
 * NOTE: No baked-in text glyphs. All human-readable copy is exposed via
 * the `title` prop for the platform's translation engine.
 */
export default function HypothermiaInsulation({
  className,
  title = "Wrap the patient in blankets and insulate from the cold ground to retain body heat",
}: HypothermiaInsulationProps) {
  const STROKE = "#333333";
  const SILVER = "#E5E7EB";
  const SLATE = "#475569";
  const RED = "#F20822";

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 400 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>{title}</title>

      {/* Ground plane */}
      <rect x={20} y={240} width={360} height={8} rx={3} fill={SLATE} stroke={STROKE} strokeWidth={3} />

      {/* Red base floor pad rail — insulation from cold ground */}
      <rect x={60} y={225} width={280} height={14} rx={4} fill={RED} stroke={STROKE} strokeWidth={3} opacity={0.9} />
      {/* Pad rail detail lines */}
      <line x1={80} y1={232} x2={100} y2={232} stroke={SILVER} strokeWidth={2} strokeLinecap="round" />
      <line x1={180} y1={232} x2={200} y2={232} stroke={SILVER} strokeWidth={2} strokeLinecap="round" />
      <line x1={280} y1={232} x2={300} y2={232} stroke={SILVER} strokeWidth={2} strokeLinecap="round" />

      {/* Patient body — lying flat, wrapped in blanket */}
      <path
        d="M90 225 L310 225 Q318 225 318 217 L318 185 Q318 165 302 155 L240 140 Q224 135 208 140 L140 155 Q120 165 120 185 L120 217 Q120 225 90 225 Z"
        fill={SILVER}
        stroke={STROKE}
        strokeWidth={4}
        strokeLinejoin="round"
      />

      {/* Head — partially visible above blanket */}
      <ellipse
        cx={105}
        cy={125}
        rx={32}
        ry={26}
        fill={SILVER}
        stroke={STROKE}
        strokeWidth={4}
      />

      {/* Blanket outer wrap layer 1 */}
      <path
        d="M85 200 Q110 160 140 150 Q180 138 220 142 Q260 146 300 155 Q325 162 335 190 Q340 205 330 220 L310 225 L90 225 Q80 215 85 200 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth={4}
        strokeLinejoin="round"
      />

      {/* Blanket outer wrap layer 2 (fold overlay) */}
      <path
        d="M95 210 Q120 170 150 158 Q190 146 230 150 Q270 154 310 162 Q330 168 340 195 Q345 210 335 222"
        fill="none"
        stroke={STROKE}
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* Blanket fold line details */}
      <path
        d="M140 150 Q180 145 220 148 Q260 152 300 160"
        fill="none"
        stroke={SLATE}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M130 170 Q180 162 230 166 Q280 170 320 180"
        fill="none"
        stroke={SLATE}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Thermal lock arrows — left side pointing inward toward body */}
      {/* Arrow 1 — upper left */}
      <line x1={30} y1={110} x2={70} y2={125} stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <polygon points="70,125 62,118 64,129" fill={RED} />

      {/* Arrow 2 — mid left */}
      <line x1={25} y1={150} x2={65} y2={155} stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <polygon points="65,155 57,148 59,159" fill={RED} />

      {/* Arrow 3 — lower left */}
      <line x1={30} y1={190} x2={70} y2={180} stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <polygon points="70,180 62,173 64,184" fill={RED} />

      {/* Thermal lock arrows — right side pointing inward toward body */}
      {/* Arrow 1 — upper right */}
      <line x1={370} y1={110} x2={330} y2={125} stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <polygon points="330,125 338,118 336,129" fill={RED} />

      {/* Arrow 2 — mid right */}
      <line x1={375} y1={150} x2={335} y2={155} stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <polygon points="335,155 343,148 341,159" fill={RED} />

      {/* Arrow 3 — lower right */}
      <line x1={370} y1={190} x2={330} y2={180} stroke={RED} strokeWidth={3} strokeLinecap="round" />
      <polygon points="330,180 338,173 336,184" fill={RED} />

      {/* Red warning indicator ring around torso (heat containment zone) */}
      <ellipse
        cx={200}
        cy={170}
        rx={115}
        ry={48}
        fill="none"
        stroke={RED}
        strokeWidth={3}
        strokeDasharray="10 6"
        opacity={1.0}
      />

      {/* Red thermal radiating lines — upper arc suggesting warmth */}
      <path
        d="M140 130 Q200 115 260 130"
        fill="none"
        stroke={RED}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.6}
      />
      <path
        d="M150 120 Q200 105 250 120"
        fill="none"
        stroke={RED}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.4}
      />
    </svg>
  );
}
