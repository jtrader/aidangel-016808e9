interface StrokeFaceCheckProps {
  className?: string;
  title?: string;
}

/**
 * StrokeFaceCheck — a simplified 2D schematic human face profile
 * demonstrating facial asymmetry (drooping eye and mouth) with a
 * central alignment scale and an emergency red warning ring.
 */
export default function StrokeFaceCheck({
  className,
  title = "Check for facial droop — one side of the face may be weak",
}: StrokeFaceCheckProps) {
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

      {/* Background surface */}
      <rect x={20} y={20} width={360} height={220} rx={12} fill="#F9FAFB" stroke={STROKE} strokeWidth={3} />

      {/* Head silhouette */}
      <path
        d="M200 40 Q280 40 280 110 Q280 160 240 200 Q220 220 200 220 Q180 220 160 200 Q120 160 120 110 Q120 40 200 40 Z"
        fill={SILVER}
        stroke={STROKE}
        strokeWidth={4}
        strokeLinejoin="round"
      />

      {/* Hair top contour */}
      <path
        d="M130 80 Q160 30 200 30 Q240 30 270 80"
        fill="none"
        stroke={STROKE}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Centre alignment scale — slate-grey drop-line down the face axis */}
      <line x1={200} y1={40} x2={200} y2={220} stroke={SLATE} strokeWidth={2} strokeDasharray="6 4" opacity={0.7} />
      {/* Scale ticks */}
      <line x1={195} y1={70} x2={205} y2={70} stroke={SLATE} strokeWidth={2} />
      <line x1={195} y1={110} x2={205} y2={110} stroke={SLATE} strokeWidth={2} />
      <line x1={195} y1={150} x2={205} y2={150} stroke={SLATE} strokeWidth={2} />
      <line x1={195} y1={190} x2={205} y2={190} stroke={SLATE} strokeWidth={2} />

      {/* Left eye (normal side) */}
      <ellipse cx={165} cy={105} rx={14} ry={10} fill="#FFFFFF" stroke={STROKE} strokeWidth={3} />
      <circle cx={165} cy={105} r={5} fill={STROKE} />
      {/* Left eyebrow (level) */}
      <path d="M150 88 Q165 82 180 88" fill="none" stroke={STROKE} strokeWidth={3} strokeLinecap="round" />

      {/* Right eye (drooping side) */}
      <ellipse cx={235} cy={112} rx={14} ry={10} fill="#FFFFFF" stroke={STROKE} strokeWidth={3} />
      <circle cx={235} cy={112} r={5} fill={STROKE} />
      {/* Right eyebrow (drooping down) */}
      <path d="M220 88 Q235 96 250 92" fill="none" stroke={STROKE} strokeWidth={3} strokeLinecap="round" />

      {/* Nose */}
      <path d="M200 115 L195 150 L205 150 Z" fill={SLATE} stroke={STROKE} strokeWidth={3} strokeLinejoin="round" />

      {/* Mouth — left corner level, right corner drooping */}
      <path
        d="M155 175 Q165 180 175 178 Q185 176 195 175 Q200 174 205 175 Q215 178 225 185 Q235 190 245 188"
        fill="none"
        stroke={STROKE}
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* Drooping right corner emphasis line */}
      <path d="M230 183 Q245 195 255 200" fill="none" stroke={RED} strokeWidth={3} strokeLinecap="round" opacity={0.85} />

      {/* Emergency red warning indicator ring — pinpointing the right facial weakness zone */}
      <circle cx={235} cy={145} r={48} fill="none" stroke={RED} strokeWidth={4} opacity={0.9} />
      <circle cx={235} cy={145} r={38} fill="none" stroke={RED} strokeWidth={2} opacity={0.6} strokeDasharray="4 4" />

      {/* Warning icon inside the ring */}
      <polygon points="235,120 225,140 245,140" fill={RED} stroke={RED} strokeWidth={1} strokeLinejoin="round" opacity={1} />
      <line x1={235} y1={144} x2={235} y2={150} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={235} cy={154} r={1.5} fill="#FFFFFF" />

      {/* Radiating warning lines from the ring */}
      <line x1={280} y1={120} x2={295} y2={108} stroke={RED} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
      <line x1={285} y1={145} x2={305} y2={145} stroke={RED} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
      <line x1={280} y1={170} x2={295} y2={182} stroke={RED} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />

      {/* Label */}
      <text
        x={200}
        y={250}
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={12}
        fontWeight={700}
        fill={RED}
        letterSpacing={0.5}
      >
        FACIAL DROOP
      </text>
    </svg>
  );
}
