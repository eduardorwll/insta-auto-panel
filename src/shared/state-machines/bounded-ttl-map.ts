/** Map em memória com limite de entradas (MAX_ENTRIES) e expurgo por TTL. */
export class BoundedTtlMap<V> {
  private store = new Map<string, { value: V; expiresAt: number }>();
  constructor(private maxEntries: number, private ttlMs: number) {}

  get size(): number {
    return this.store.size;
  }

  get(key: string, now = Date.now()): V | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (e.expiresAt <= now) {
      this.store.delete(key);
      return undefined;
    }
    return e.value;
  }

  set(key: string, value: V, now = Date.now()): void {
    this.store.delete(key);
    if (this.store.size >= this.maxEntries) this.purge(now);
    while (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt: now + this.ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  purge(now = Date.now()): void {
    for (const [k, e] of this.store) if (e.expiresAt <= now) this.store.delete(k);
  }
}
