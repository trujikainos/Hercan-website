import Script from "next/script";

// Google Analytics 4. El Measurement ID es PÚBLICO (va en el cliente); se puede
// sobreescribir en Vercel con NEXT_PUBLIC_GA_ID. El layout lo monta SOLO cuando
// el sitio es indexable (producción real) → no contamina métricas con tráfico
// de local/preview. Carga con `afterInteractive` (no bloquea el render).
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-8EKKWTTM7E";

export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
