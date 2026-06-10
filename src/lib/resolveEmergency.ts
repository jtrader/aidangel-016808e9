/** Replace hardcoded Australian "000" with the locale-correct emergency number. */
export function resolveEmergency(text: string, number: string): string {
  if (number === "000") return text;
  return text.replace(/\b000\b/g, number);
}
