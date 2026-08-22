/** Inline validation message rendered under a form field. */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs font-semibold text-destructive">
      {message}
    </p>
  );
}
