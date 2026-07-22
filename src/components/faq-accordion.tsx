import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/faq";

/** Acordeón de FAQs (nativo `<details>`, accesible, contenido siempre en el DOM). */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="border-y border-hc-metal-light">
      {faqs.map((f) => (
        <details
          key={f.question}
          className="group border-b border-hc-metal-light last:border-b-0"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-medium text-hc-ink [&::-webkit-details-marker]:hidden">
            {f.question}
            <ChevronDown
              className="h-4 w-4 shrink-0 text-hc-steel transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="pb-3 text-sm leading-relaxed text-hc-gunmetal">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
