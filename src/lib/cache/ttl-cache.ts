/**
 * Caché en memoria con expiración por entrada y cota superior de tamaño.
 *
 * Pensada para procesos serverless: vive lo que vive la instancia y nunca crece
 * sin límite. No sustituye a un store compartido (Redis); su objetivo es evitar
 * consultas repetidas dentro de una misma instancia.
 */
export class TtlCache<T> {
  private readonly entries = new Map<string, { value: T; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 5_000,
    private readonly now: () => number = Date.now,
  ) {}

  get(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    // Map conserva el orden de inserción: re-insertar mueve la clave al final,
    // de modo que la evicción por tamaño descarta siempre la más antigua.
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });

    if (this.entries.size > this.maxEntries) this.evictOldest();
  }

  /** Aplica `update` sobre el valor vigente. No revive entradas expiradas. */
  update(key: string, update: (current: T) => T): void {
    const current = this.get(key);
    if (current === undefined) return;

    // Conserva la expiración original: refrescarla dejaría a un cliente activo
    // indefinidamente sobre un valor obsoleto.
    const expiresAt = this.entries.get(key)!.expiresAt;
    this.entries.set(key, { value: update(current), expiresAt });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }

  private evictOldest(): void {
    const oldest = this.entries.keys().next();
    if (!oldest.done) this.entries.delete(oldest.value);
  }
}
