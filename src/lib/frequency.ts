/**
 * Etiquetas de cantidad según la frecuencia de entrega del suministro recurrente.
 * Compartido por el formulario (cliente), los correos y la nota del borrador,
 * para que "Cant./mes" cambie a "Cant./trimestre", etc., conforme a la frecuencia.
 */
export function qtyLabelFor(recurring: boolean, frecuencia?: string): string {
  if (!recurring) return "Cantidad";
  switch (frecuencia) {
    case "Mensual":
      return "Cant./mes";
    case "Quincenal":
      return "Cant./quincena";
    case "Trimestral":
      return "Cant./trimestre";
    case "Semestral":
      return "Cant./semestre";
    default:
      return "Cant./entrega"; // personalizada (cada N meses/semanas)
  }
}

/** Versión larga (para correos y notas). */
export function qtyLabelLong(recurring: boolean, frecuencia?: string): string {
  if (!recurring) return "Cantidad";
  switch (frecuencia) {
    case "Mensual":
      return "Cant. mensual aprox.";
    case "Quincenal":
      return "Cant. quincenal aprox.";
    case "Trimestral":
      return "Cant. trimestral aprox.";
    case "Semestral":
      return "Cant. semestral aprox.";
    default:
      return "Cant. por entrega aprox.";
  }
}
