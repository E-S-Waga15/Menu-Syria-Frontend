import { CalendarDays, Mail } from "lucide-react";

import { AboutEyebrow } from "@/features/marketing/components/about-eyebrow";
import type { Dictionary } from "@/i18n/get-dictionary";

/** the address the footer already publishes — one place to change it */
const CONTACT_EMAIL = "hello@menusyria.com";

/** one clause of the document, as the dictionaries store it */
type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
};

/**
 * The shared shell for the privacy policy and the terms.
 *
 * Numbering is the page's structural device, and it is the one place on the
 * site where numbers are load-bearing rather than decorative: a clause in a
 * legal document is cited by its number, so the figure in the margin and the
 * `id` on each section are how someone points at "clause 5" — with a URL that
 * lands on it.
 *
 * Everything is a server component so the whole text sits in the initial HTML,
 * which is what a legal page is for: readable without JS, and indexable.
 */
export function LegalPage({
  t,
  doc,
}: {
  t: Dictionary;
  /** which of the two documents to render */
  doc: "privacy" | "terms";
}) {
  const page = t.legal[doc];
  const sections = page.sections as readonly LegalSection[];

  // "…on {email} and we will reply" — split so the address is a real mailto
  const [contactBefore, contactAfter] = t.legal.contactBody.split("{email}");

  return (
    <main>
      <header className="border-b border-border/60 bg-surface-container-low">
        <div className="container-page py-10 sm:py-14 md:py-20">
          <AboutEyebrow>{page.eyebrow}</AboutEyebrow>
          <h1 className="text-display mt-4 text-2xl sm:text-3xl md:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:mt-5 md:text-lg">
            {page.intro}
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground sm:mt-7">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            {t.legal.updatedOn}: {t.legal.updatedAt}
          </p>
        </div>
      </header>

      <div className="container-page grid gap-8 py-10 sm:py-14 md:py-20 lg:grid-cols-[minmax(0,15rem)_minmax(0,46rem)] lg:gap-16">
        {/* The index is a scrolling rail of chips on a phone — the same shape
            as the storefront's category bar — and a sticky column from lg,
            where there is margin to spare beside the text. */}
        <nav
          aria-label={t.legal.onThisPage}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <h2 className="label-eyebrow text-muted-foreground">
            {t.legal.onThisPage}
          </h2>
          <ol className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-8 md:px-8 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-x-visible lg:px-0 lg:pb-0">
            {sections.map((section, index) => (
              <li key={section.id} className="shrink-0 lg:shrink">
                <a
                  href={`#${section.id}`}
                  className="flex items-baseline gap-2.5 rounded-full border border-border/60 px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap sm:text-sm lg:whitespace-normal text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary lg:rounded-none lg:border-0 lg:border-s-2 lg:border-s-border/60 lg:px-4 lg:hover:border-s-primary"
                >
                  <span className="text-xs tabular-nums opacity-60">
                    {index + 1}
                  </span>
                  <span className="lg:min-w-0">{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 space-y-10 sm:space-y-12 md:space-y-14">
          {sections.map((section, index) => {
            // every section in both documents follows the same shape: a lead
            // paragraph, then its list, then whatever qualifies the list
            const [lead, ...rest] = section.paragraphs;

            return (
              <section
                key={section.id}
                id={section.id}
                // the rule separates one clause from the next; the first
                // needs none because the page header already does that job
                className="scroll-mt-24 border-t border-border/60 pt-8 first:border-0 first:pt-0 sm:pt-10 md:scroll-mt-28"
                aria-labelledby={`${section.id}-title`}
              >
                <div className="flex items-baseline gap-3 pb-1">
                  <span
                    className="font-heading text-sm font-bold text-zest tabular-nums"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2
                    id={`${section.id}-title`}
                    className="font-heading text-lg font-bold sm:text-xl md:text-2xl"
                  >
                    {section.title}
                  </h2>
                </div>

                {lead && (
                  <p className="mt-5 text-[15px] leading-[1.95] break-words text-muted-foreground">
                    {lead}
                  </p>
                )}

                {section.bullets.length > 0 && (
                  <ul className="mt-6 space-y-4">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex gap-3 text-[15px] leading-[1.95] break-words text-muted-foreground"
                      >
                        <span
                          className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-zest"
                          aria-hidden
                        />
                        <span className="min-w-0">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {rest.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-6 text-[15px] leading-[1.95] break-words text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            );
          })}

          {/* the one thing a reader who got this far is likely to want next */}
          <aside className="mt-16! rounded-2xl border border-border/60 border-s-2 border-s-primary bg-surface-container-low p-5 sm:p-6">
            <h2 className="font-heading text-lg font-bold">
              {t.legal.contactTitle}
            </h2>
            <p className="mt-3 text-[15px] leading-[1.95] break-words text-muted-foreground">
              {contactBefore}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                dir="ltr"
                className="font-semibold text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
              >
                {CONTACT_EMAIL}
              </a>
              {contactAfter}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-berry-bright"
            >
              <Mail className="size-4" aria-hidden />
              {t.legal.contactCta}
            </a>
          </aside>
        </article>
      </div>
    </main>
  );
}
