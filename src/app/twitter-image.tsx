// La card de Twitter/X reutiliza el generador de la OG por defecto (mismo diseño).
// `alt`/`size`/`contentType` se declaran literalmente para que Next los lea de forma
// estática; el generador de imagen se reusa vía import del default (sin duplicar diseño).
import Image from "./opengraph-image";

export const alt =
  "HERCAN — Herramientas de corte para CNC y equipos de medición";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default Image;
