import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-heading text-8xl font-bold text-berry-soft-foreground/30">
        404
      </p>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold">
          الصفحة غير موجودة — Page not found
        </h1>
        <p className="text-muted-foreground">
          يبدو أن هذا الطبق ليس على قائمتنا. — Looks like this dish is not on
          our menu.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
      >
        العودة للرئيسية · Back home
      </Link>
    </main>
  );
}
