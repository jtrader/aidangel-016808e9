/** Replace hardcoded Australian "000" with the locale-correct emergency number. */
export function resolveEmergency(text: string, number: string): string {
  if (number === "000") return text;
  return text.replace(/\b000\b/g, number);
}

/**
 * Replace contextual "in Australia" / "In Australia" / "across Australia" phrases
 * with the locale country name so non-AU users see their own country in KB content.
 * Deliberately does NOT replace adjective form "Australian ..." or proper nouns
 * like "Australian Resuscitation Council".
 */
export function resolveCountry(text: string, countryName: string): string {
  if (!countryName || countryName.toLowerCase() === "australia") return text;
  return text
    .replace(/\bIn Australia\b/g, `In ${countryName}`)
    .replace(/\bin Australia\b/g, `in ${countryName}`)
    .replace(/\bacross Australia\b/g, `across ${countryName}`)
    .replace(/\bAustralia-wide\b/g, `${countryName}-wide`);
}
