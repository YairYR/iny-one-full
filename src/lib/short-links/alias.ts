/**
 * El alias es una **etiqueta interna** para reconocer un enlace en el panel.
 * No es el slug, no viaja en ninguna URL y no resuelve: cambiarlo no cambia
 * `iny.one/<slug>`.
 *
 * De ahí la regla, que antes era mucho más estrecha: cuando el alias aparentaba
 * ser parte del enlace tenía sentido limitarlo al alfabeto de una URL, pero eso
 * dejaba fuera la ñ y los acentos —«Campaña de julio» se rechazaba— en un
 * producto de público mayoritariamente chileno. Como etiqueta, la única
 * restricción con motivo es que no pueda parecer marcado ni traer caracteres de
 * control; React ya escapa el texto al pintarlo.
 */
export const ALIAS_MAX_LENGTH = 60;

/** Ángulos —para que nunca pueda parecer marcado— y caracteres de control. */
const FORBIDDEN_ALIAS_CHARS = /[<>\u0000-\u001f\u007f]/;

/** Cadena vacía significa «sin etiqueta» y es válida: limpia el alias. */
export function isValidAlias(alias: string): boolean {
  return alias.length <= ALIAS_MAX_LENGTH && !FORBIDDEN_ALIAS_CHARS.test(alias);
}

/** Normaliza para guardar: sin espacios sobrantes, y vacío se guarda como null. */
export function normalizeAlias(alias: string): string | null {
  const trimmed = alias.trim();
  return trimmed.length > 0 ? trimmed : null;
}
