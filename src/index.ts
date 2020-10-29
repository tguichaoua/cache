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
    get(key: K): V | undefined;
    /**
     * Gets an element with the specified key, and returns its value, or `undefined` if the element does not exist.
     * If restart is `true`, the ttl of the element (if it exists) is reset to the defautl ttl.
     * @param key The key of the element to get.
     * @param restart Either or not the ttl is reset to the default ttl.
     */
    get(key: K, restart: boolean): V | undefined;
    /**
     * Gets an element with the specified key, and returns its value, or `undefined` if the element does not exist.
     * The ttl of the element (if it exists) is reset to the restartTtl.
     * @param key The key of the element to get.
     * @param restartTtl The time to live in milliseconds to set.
     */
    get(key: K, restartTtl: number): V | undefined;
    get(key: K, restart?: boolean | number): V | undefined {
        const e = this.storage.get(key);
        if (!e) return undefined;
        if (typeof restart !== 'undefined' && restart !== false) {
            const ttl = typeof restart === 'number' ? restart : this.ttl;
            clearTimeout(e.timeout);
            e.timeout = setTimeout(() => this.delete(key), ttl).unref();
        }
        return e.value;
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

    /**
     * Resets the ttl of the element (if it exists) to the ttl value.
     * @param key The key of the element to restart.
     * @param ttl The time to live in milliseconds to set or the default ttl.
     * @returns Either or not the element exists.
     */
    restart(key: K, ttl: number = this.ttl): boolean {
        return this.get(key, ttl) !== undefined;
    }
}

util.inherits(Cache, EventEmitter);
