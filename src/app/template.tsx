/**
 * template.tsx se re-monta en cada navegación → la animación pageEnter se reproduce
 * en cada cambio de ruta. Solo transform (LCP-safe). El flex-col preserva el footer
 * al fondo (mt-auto de las páginas depende de un contenedor flex de altura completa).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex flex-1 flex-col">{children}</div>;
}
