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
