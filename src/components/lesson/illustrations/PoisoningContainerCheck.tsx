/**
 * PoisoningContainerCheck inline SVG illustration.
 *
 * Visual blueprint:
 * - Thick dark charcoal outlines (#333333)
 * - Flat 2D vector shapes with solid light-silver and slate-grey fills
 * - Vibrant Emergency Red accents for action targets
 *
 * Depiction: A classic industrial chemical or household bottle vector shape tilted
 * to the side on a counter surface. A sharp Emergency Red target circle sits over
 * the product's ingredient information panel on the label. A red directional arrow
 * leads from the bottle toward a generic telephone icon receiver, illustrating the
 * vital act of gathering container data for emergency operators.
 */

import { cn } from "@/lib/utils";

interface PoisoningContainerCheckProps {
  className?: string;
}

export default function PoisoningContainerCheck({ className }: PoisoningContainerCheckProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid meet"
      className={cn("block w-full max-w-md", className)}
      aria-labelledby="poisoning-title"
      role="img"
    >
      <title id="poisoning-title">Poisoning Container Check</title>

      {/* Definitions: arrowheads and markers */}
      <defs>
        {/* Arrowhead for direction toward phone */}
        <marker
          id="phone-arrow-head"
          markerWidth="10"
          markerHeight="10"
          refX="0"
          refY="5"
          orient="auto"
        >
          <polygon points="0 0, 10 5, 1 9" fill="#F20822" />
        </marker>
      </defs>

      {/* Background panel */}
      <rect x="0" y="1" width="400" height="258" fill="#F9FAFB" rx="12" />

      {/* Counter surface */}
      <rect x="20" y="205" width="360" height="48" fill="#E5E7EB" stroke="#333333" strokeWidth="3" rx="6" />
      {/* Counter top edge highlight */}
      <line x1="22" y1="205" x2="378" y2="205" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* Bottle shadow on counter */}
      <ellipse cx="165" cy="210" rx="55" ry="10" fill="#CBD5E1" opacity="0.7" />

      {/* Bottle body (tilted slightly to the right) */}
      <g transform="rotate(18, 165, 160)">
        {/* Main bottle body */}
        <rect
          x="115"
          y="75"
          width="100"
          height="160"
          rx="14"
          fill="#E5E7EB"
          stroke="#333333"
          strokeWidth="3"
        />

        {/* Bottle neck */}
        <rect
          x="140"
          y="45"
          width="50"
          height="35"
          rx="6"
          fill="#E5E7EB"
          stroke="#333333"
          strokeWidth="3"
        />

        {/* Bottle cap */}
        <rect
          x="135"
          y="32"
          width="60"
          height="18"
          rx="4"
          fill="#475569"
          stroke="#333333"
          strokeWidth="3"
        />
        {/* Cap ridge lines */}
        <line x1="145" y1="32" x2="145" y2="50" stroke="#333333" strokeWidth="2" />
        <line x1="155" y1="32" x2="155" y2="50" stroke="#333333" strokeWidth="2" />
        <line x1="165" y1="32" x2="165" y2="50" stroke="#333333" strokeWidth="2" />
        <line x1="175" y1="32" x2="175" y2="50" stroke="#333333" strokeWidth="2" />
        <line x1="185" y1="32" x2="185" y2="50" stroke="#333333" strokeWidth="2" />

        {/* Shoulder taper line */}
        <path
          d="M 140 80 Q 140 70 145 65 L 155 55 L 175 55 L 185 65 Q 190 70 190 80"
          fill="#E5E7EB"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Label background */}
        <rect
          x="122"
          y="100"
          width="86"
          height="110"
          rx="6"
          fill="#F9FAFB"
          stroke="#333333"
          strokeWidth="2"
        />

        {/* Label top strip (brand area) */}
        <rect
          x="124"
          y="102"
          width="82"
          height="28"
          rx="3"
          fill="#CBD5E1"
        />

        {/* Label title lines */}
        <line x1="132" y1="112" x2="198" y2="112" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="132" y1="122" x2="180" y2="122" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

        {/* Label ingredient panel area (where target circle sits) */}
        <rect
          x="128"
          y="138"
          width="74"
          height="52"
          rx="3"
          fill="#E5E7EB"
          stroke="#94A3B8"
          strokeWidth="1.5"
        />

        {/* Ingredient text lines (stylized) */}
        <line x1="134" y1="146" x2="190" y2="146" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="134" y1="154" x2="184" y2="154" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="134" y1="162" x2="188" y2="162" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="134" y1="170" x2="180" y2="170" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="134" y1="178" x2="186" y2="178" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="134" y1="186" x2="176" y2="186" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Warning diamond icon on label */}
        <polygon
          points="165,132 175,142 165,152 155,142"
          fill="#475569"
          stroke="#333333"
          strokeWidth="1.5"
        />
        <line x1="160" y1="142" x2="170" y2="142" stroke="#F20822" strokeWidth="2" strokeLinecap="round" />
        <line x1="165" y1="137" x2="165" y2="147" stroke="#F20822" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Red boundary indicator ring around bottle zone */}
      <ellipse
        cx="165"
        cy="145"
        rx="65"
        ry="75"
        fill="none"
        stroke="#F20822"
        strokeWidth="2"
        strokeDasharray="5 4"
        opacity="1"
      />

      {/* Emergency Red target circle over ingredient panel */}
      <circle
        cx="170"
        cy="168"
        r="26"
        fill="none"
        stroke="#F20822"
        strokeWidth="2.5"
        opacity="1"
      />
      <circle
        cx="170"
        cy="168"
        r="18"
        fill="none"
        stroke="#F20822"
        strokeWidth="2"
        strokeDasharray="4 3"
        opacity="1"
      />
      {/* Crosshair center dot */}
      <circle cx="170" cy="168" r="4" fill="#F20822" />
      {/* Crosshair lines */}
      <line x1="170" y1="150" x2="170" y2="186" stroke="#F20822" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="152" y1="168" x2="188" y2="168" stroke="#F20822" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

      {/* Red pulse ring around target */}
      <circle cx="170" cy="168" r="30" fill="none" stroke="#F20822" strokeWidth="1.5" opacity="0.8">
        <animate
          attributeName="r"
          values="26;32;26"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8; 1; 0.8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Telephone receiver icon (generic) */}
      <g transform="translate(290, 100)">
        {/* Phone base shadow */}
        <ellipse cx="0" cy="95" rx="35" ry="8" fill="#CBD5E1" opacity="0.6" />

        {/* Phone body / cradle */}
        <rect
          x="-30"
          y="70"
          width="60"
          height="20"
          rx="6"
          fill="#475569"
          stroke="#333333"
          strokeWidth="3"
        />
        {/* Cradle notch */}
        <ellipse cx="0" cy="70" rx="20" ry="6" fill="#CBD5E1" stroke="#333333" strokeWidth="2" />

        {/* Handset receiver */}
        <path
          d="M -22 18 Q -28 0 -18 -8 Q -8 -14 0 -14 Q 8 -14 18 -8 Q 28 0 22 18 Q 18 28 10 30 Q 0 32 -10 30 Q -18 28 -22 18 Z"
          fill="#E5E7EB"
          stroke="#333333"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Ear piece */}
        <ellipse cx="0" cy="-4" rx="10" ry="7" fill="#CBD5E1" stroke="#333333" strokeWidth="2" />
        {/* Mouth piece */}
        <ellipse cx="0" cy="22" rx="10" ry="5" fill="#CBD5E1" stroke="#333333" strokeWidth="2" />
        {/* Cord curve */}
        <path
          d="M -15 26 Q -28 50 -20 68"
          fill="none"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 15 26 Q 28 50 20 68"
          fill="none"
          stroke="#333333"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cord detail lines */}
        <path
          d="M -20 68 Q -10 72 0 72 Q 10 72 20 68"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* Red directional arrow from bottle toward phone */}
      <path
        d="M 235 145 Q 260 130 275 125"
        fill="none"
        stroke="#F20822"
        strokeWidth="5"
        strokeLinecap="round"
        markerEnd="url(#phone-arrow-head)"
      />
      {/* Arrow highlight */}
      <path
        d="M 235 145 Q 260 130 270 127"
        fill="none"
        stroke="#FF4D5A"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Action dots along arrow path */}
      <circle cx="245" cy="140" r="3.5" fill="#F20822" />
      <circle cx="258" cy="132" r="3" fill="#F20822" />

      {/* Small red action target near phone */}
      <circle cx="280" cy="122" r="4" fill="#F20822" />
      <circle cx="280" cy="122" r="7" fill="none" stroke="#F20822" strokeWidth="1.5" />

      {/* Small text node for screen readers / i18n (hidden) */}
      <text x="0" y="0" fontSize="0" fill="none" aria-hidden="true">
        Tilted chemical bottle on a counter with red target circle over ingredient label, and arrow pointing toward a telephone receiver
      </text>
    </svg>
  );
}
