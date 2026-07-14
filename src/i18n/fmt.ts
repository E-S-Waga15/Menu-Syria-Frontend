/** Replaces {placeholders} in a translated string: fmt(t.auth.otpBody, { phone }) */
export function fmt(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
