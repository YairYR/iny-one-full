import { nanoid } from "nanoid";
import { isReservedSlug } from "@/lib/reserved-slugs";

/** Longitud por defecto de los slugs autogenerados. */
export const SLUG_SIZE = 7;

/**
 * Intentos máximos para obtener un slug que no choque con la denylist.
 * Con 7 caracteres del alfabeto de nanoid el espacio es de ~3,5·10¹², así que
 * agotar estos intentos implica un fallo real, no mala suerte.
 */
export const MAX_SLUG_GENERATION_ATTEMPTS = 25;

/**
 * Intentos máximos de inserción ante colisión de slug en base de datos.
 * Cada reintento genera un slug nuevo, por lo que la probabilidad de agotarlos
 * es despreciable salvo que la tabla esté cerca de saturar el espacio de claves.
 */
export const MAX_SLUG_INSERT_ATTEMPTS = 5;

/** Longitud admitida para un slug elegido por el usuario. */
export const CUSTOM_SLUG = { min: 3, max: 32 } as const;

/**
 * Letras minúsculas, dígitos, guion y guion bajo; ni empieza ni termina en
 * separador. Se descarta el punto para que un slug no pueda parecer un fichero
 * (`algo.json`) ni chocar con las rutas de recursos ya reservadas.
 */
const CUSTOM_SLUG_RE = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

/**
 * Normaliza un slug **propuesto por el usuario**.
 *
 * Trampa: el resolver compara de forma exacta (`.eq('slug', short)`) y los
 * slugs ya existentes generados por nanoid son de caso mixto. Normalizar en la
 * resolución rompería todos esos enlaces, así que se normaliza sólo en la
 * entrada. La consecuencia asumida es que `iny.one/Promo` escrito con mayúscula
 * no resuelve a `promo`: se prefiere eso a tocar la ruta de más tráfico del
 * sitio por tolerancia a erratas.
 */
export function normalizeCustomSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Comprueba forma y longitud. No comprueba disponibilidad ni reservas. */
export function isValidCustomSlug(slug: string): boolean {
  return slug.length >= CUSTOM_SLUG.min
    && slug.length <= CUSTOM_SLUG.max
    && CUSTOM_SLUG_RE.test(slug);
}

export class SlugGenerationError extends Error {
  constructor(attempts: number) {
    super(`could not generate a valid slug after ${attempts} attempts`);
    this.name = 'SlugGenerationError';
  }
}

/**
 * Genera un slug aleatorio que no colisiona con ninguna ruta reservada.
 *
 * @throws {SlugGenerationError} si no encuentra un candidato válido.
 */
export function generateSlug(size: number = SLUG_SIZE, generate: (size: number) => string = nanoid): string {
  for (let attempt = 0; attempt < MAX_SLUG_GENERATION_ATTEMPTS; attempt++) {
    const candidate = generate(size).toLowerCase();
    if (!isReservedSlug(candidate)) return candidate;
  }

  throw new SlugGenerationError(MAX_SLUG_GENERATION_ATTEMPTS);
}
