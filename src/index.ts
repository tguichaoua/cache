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

    /**
     * @param ttl Time to live in milliseconds.
     */
    constructor(private readonly ttl: number) {}

    *[Symbol.iterator](): Iterator<[K, V]> {
        for (const [k, v] of this.storage) yield [k, v.value];
    }

    /** The number of elements in the cache. */
    get size() {
        return this.storage.size;
    }

    /**
     * Adds or replaces an element with the specified key.
     * @param key The key of the element to add.
     * @param value The value of the element to add.
     * @param ttl Time to live in milliseconds.
     */
    set(key: K, value: V, ttl?: number): this {
        const prev = this.storage.get(key);
        if (prev) clearTimeout(prev.timeout);
        if (!ttl) ttl = this.ttl;
        this.storage.set(key, {
            value,
            timeout: setTimeout(() => this.delete(key), ttl).unref(),
        });
        return this;
    }

    /**
     * Gets an element with the specified key, and returns its value, or `undefined` if the element does not exist.
     * @param key The key of the element to get.
     */
    get(key: K): V | undefined {
        return this.storage.get(key)?.value;
    }

    /**
     * Checks if an element exists in the cache.
     * @param key The key to check.
     * @returns Either or not an element exists at the specified key.
     */
    has(key: K): boolean {
        return this.storage.has(key);
    }

    /**
     * Deletes an element from the cache.
     * @param key The key to delete from the cache.
     * @returns Either or not the element was removed.
     */
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

    /**
     * Removes all elements from the cache.
     */
    clear(): void {
        for (const entry of this.storage.values()) clearTimeout(entry.timeout);
        this.storage.clear();
    }
}

util.inherits(Cache, EventEmitter);
