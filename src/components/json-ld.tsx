/**
 * Inyecta JSON-LD en el HTML del servidor con escape anti-XSS.
 * (Escapar `<` evita romper el documento / inyección vía datos de producto.)
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
