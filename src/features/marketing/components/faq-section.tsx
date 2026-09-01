import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Dictionary } from "@/i18n/get-dictionary";
import { faqJsonLd, JsonLd } from "@/lib/seo/json-ld";

/** the four questions owners actually ask before signing up */
export function faqItems(t: Dictionary) {
  return [
    { q: t.home.faq1Q, a: t.home.faq1A },
    { q: t.home.faq2Q, a: t.home.faq2A },
    { q: t.home.faq3Q, a: t.home.faq3A },
    { q: t.home.faq4Q, a: t.home.faq4A },
  ];
}

/**
 * Frequently asked questions.
 *
 * Rendered as a server component with every answer in the initial HTML — the
 * accordion hides answers visually, but crawlers still read them, which is the
 * whole point of shipping FAQPage structured data alongside.
 *
 * Answers are held to one paragraph each and name the real route ("the Create
 * account button", "your area agent") rather than describing the platform in
 * the abstract, so a reader can act on the answer without hunting for the step.
 */
export function Faq({ t }: { t: Dictionary }) {
  const items = faqItems(t);

  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-eyebrow text-primary">{t.home.faqEyebrow}</p>
          <h2 className="text-display mt-3 text-3xl md:text-4xl">
            {t.home.faqTitle}
          </h2>
        </div>

        <Accordion className="mx-auto mt-10 max-w-3xl">
          {items.map((item) => (
            <AccordionItem
              key={item.q}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="py-5 font-heading text-base font-bold hover:no-underline md:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
