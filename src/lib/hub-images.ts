/**
 * Portadas (Higgsfield) de las taxonomías, por slug. FUENTE ÚNICA: al generar una
 * imagen se agrega aquí `slug -> "/brand/taxonomia/<archivo>"` y aparece sola en el
 * hub (tarjeta) y en el hero de la página individual. Vacío = layout de solo texto
 * (degradación elegante). Sigue la dirección visual de marca (escenas reales, luz
 * azul HERCAN, técnico mexicano, sin logos de terceros).
 *
 * Claves = mismos slugs que las páginas: /categoria/[slug], /tipo/[slug],
 * /material/[slug], /recubrimiento/[slug], /para/[slug], /iso/[slug].
 */
export const HUB_IMAGES: {
  categoria: Record<string, string | undefined>;
  tipo: Record<string, string | undefined>;
  material: Record<string, string | undefined>;
  recubrimiento: Record<string, string | undefined>;
  para: Record<string, string | undefined>;
  iso: Record<string, string | undefined>;
} = {
  categoria: {
    fresado: "/brand/taxonomia/categoria/fresado.webp",
    torneado: "/brand/taxonomia/categoria/torneado.webp",
    perforacion: "/brand/taxonomia/categoria/perforacion.webp",
    roscado: "/brand/taxonomia/categoria/roscado.webp",
    ranurado: "/brand/taxonomia/categoria/ranurado.webp",
    portaherramientas: "/brand/taxonomia/categoria/portaherramientas.webp",
    abrasivos: "/brand/taxonomia/categoria/abrasivos.webp",
    medicion: "/brand/taxonomia/categoria/medicion.webp",
    accesorios: "/brand/taxonomia/categoria/accesorios.webp",
  },
  tipo: {},
  material: {},
  recubrimiento: {},
  para: {},
  iso: {},
};
