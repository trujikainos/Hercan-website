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
  tipo: {
    inserto: "/brand/taxonomia/tipo/inserto.webp",
    "fresa-endmill": "/brand/taxonomia/tipo/fresa-endmill.webp",
    broca: "/brand/taxonomia/tipo/broca.webp",
    machuelo: "/brand/taxonomia/tipo/machuelo.webp",
    cortador: "/brand/taxonomia/tipo/cortador.webp",
    escariador: "/brand/taxonomia/tipo/escariador.webp",
    "barra-mandrinar": "/brand/taxonomia/tipo/barra-mandrinar.webp",
    portaherramientas: "/brand/taxonomia/tipo/portaherramientas.webp",
  },
  material: {},
  recubrimiento: {},
  para: {
    acero: "/brand/taxonomia/para/acero.webp",
    "acero-inoxidable": "/brand/taxonomia/para/acero-inoxidable.webp",
    fundicion: "/brand/taxonomia/para/fundicion.webp",
    aluminio: "/brand/taxonomia/para/aluminio.webp",
    superaleaciones: "/brand/taxonomia/para/superaleaciones.webp",
    endurecidos: "/brand/taxonomia/para/endurecidos.webp",
  },
  iso: {},
};
