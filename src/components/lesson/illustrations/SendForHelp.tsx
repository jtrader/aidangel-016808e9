interface SendForHelpProps {
  className?: string;
  /** Accessible label — translate via your i18n layer. */
  title?: string;
  /**
   * Emergency number shown on the phone screen.
   * Defaults to Australia's Triple Zero. Override per locale
   * (e.g. "112" for EU, "911" for US) via your translation layer.
   */
  emergencyNumber?: string;
  /** Status text under the number, e.g. "CALLING…" / "APPEL…" */
  callingLabel?: string;
}

/**
 * SendForHelp — smartphone displaying the local emergency number on a red
 * calling screen with audio-wave indicators.
 *
 * Translation-safe: the number and status text are rendered as semantic
 * <text> nodes driven by props, never baked into SVG paths.
 */
export default function SendForHelp({
  className,
  title = "Send for help: call your local emergency number",
  emergencyNumber = "000",
  callingLabel = "CALLING…",
}: SendForHelpProps) {
  const STROKE = "#333333";
  const SILVER = "#E5E7EB";
  const SLATE = "#475569";
  const RED = "#F20822";

  return (
    <svg
      role="img"
      aria-label={`${title} — ${emergencyNumber}`}
      viewBox="0 0 400 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <title>{title}</title>

      {/* Phone body */}
      <rect
        x={140}
        y={20}
        width={120}
        height={220}
        rx={20}
        fill={SLATE}
        stroke={STROKE}
        strokeWidth={4}
      />
      {/* Screen */}
      <rect
        x={152}
        y={36}
        width={96}
        height={188}
        rx={8}
        fill={RED}
        stroke={STROKE}
        strokeWidth={3}
      />
      {/* Speaker notch */}
      <rect x={185} y={28} width={30} height={5} rx={2.5} fill={STROKE} />

      {/* Emergency number — translation-driven prop */}
      <text
        x={200}
        y={120}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={44}
        fontWeight={800}
        fill="#FFFFFF"
        letterSpacing={2}
      >
        {emergencyNumber}
      </text>

      {/* Status label — translation-driven prop */}
      <text
        x={200}
        y={150}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={10}
        fontWeight={700}
        fill="#FFFFFF"
        letterSpacing={2}
      >
        {callingLabel}
      </text>

      {/* End-call button on screen */}
      <circle cx={200} cy={195} r={18} fill="#FFFFFF" stroke={STROKE} strokeWidth={3} />
      <path
        d="M191 197 Q200 188 209 197 L206 201 Q200 196 194 201 Z"
        fill={RED}
        stroke={STROKE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Audio waves — left */}
      <g stroke={RED} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M115 100 Q100 130 115 160" />
        <path d="M95 80 Q70 130 95 180" />
        <path d="M75 60 Q40 130 75 200" />
      </g>
      {/* Audio waves — right */}
      <g stroke={RED} strokeWidth={4} strokeLinecap="round" fill="none">
        <path d="M285 100 Q300 130 285 160" />
        <path d="M305 80 Q330 130 305 180" />
        <path d="M325 60 Q360 130 325 200" />
      </g>

      {/* Silver speaker badges */}
      <circle cx={60} cy={130} r={10} fill={SILVER} stroke={STROKE} strokeWidth={3} />
      <circle cx={340} cy={130} r={10} fill={SILVER} stroke={STROKE} strokeWidth={3} />
    </svg>
  );
}
