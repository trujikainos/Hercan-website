import { site } from "@/lib/site";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

/**
 * Botón flotante de WhatsApp de ventas. Solo se renderiza si hay número
 * configurado en site.whatsapp (dígitos con lada país, sin símbolos).
 */
export function WhatsAppFloat() {
  if (!site.whatsapp) return null;
  const text = encodeURIComponent(
    "Hola, me interesa cotizar herramental para CNC. ",
  );
  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      data-event="contact_whatsapp"
      className="press fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
