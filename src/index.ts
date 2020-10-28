import EEI from 'eei.ts';
import { EventEmitter } from 'events';
import util from 'util';

interface CacheEntry<V> {
    value: V;
    timeout: NodeJS.Timeout;
}

interface CacheEvents<K, V> {
    delete: [K, V];
}

export interface ReadonlyCache<K, V> extends Iterable<[K, V]> {
    get(key: K): V | undefined;
    has(key: K): boolean;
    readonly size: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Cache<K, V> extends EEI<CacheEvents<K, V>> {}

export class Cache<K, V> implements ReadonlyCache<K, V> {
    private readonly storage = new Map<K, CacheEntry<V>>();
    private readonly ttl: number;

    constructor(ttl: number) {
        this.ttl = ttl;
    }

    *[Symbol.iterator](): Iterator<[K, V]> {
        for (const [k, v] of this.storage) yield [k, v.value];
    }

    get size() {
        return this.storage.size;
    }

    set(key: K, value: V, ttl?: number): void {
        const prev = this.storage.get(key);
        if (prev) clearTimeout(prev.timeout);
        if (!ttl) ttl = this.ttl;
        this.storage.set(key, {
            value,
            timeout: setTimeout(() => this.delete(key), ttl).unref(),
        });
    }

    get(key: K): V | undefined {
        return this.storage.get(key)?.value;
    }

    has(key: K): boolean {
        return this.storage.has(key);
    }

    delete(key: K): boolean {
        const entry = this.storage.get(key);
        if (entry) {
            clearTimeout(entry.timeout);
            this.storage.delete(key);
            this.emit('delete', key, entry.value);
            return true;
        }
        return false;
    }

    clear(): void {
        for (const entry of this.storage.values()) clearTimeout(entry.timeout);
        this.storage.clear();
    }
}

util.inherits(Cache, EventEmitter);
