import * as redis from "redis";
import { RedisClientType, RedisClientOptions } from "redis";
import { DotenvConfig } from "../config/env.config";

const REDIS_HOST = DotenvConfig.REDIS_HOST || "localhost";
const REDIS_PORT = DotenvConfig.REDIS_PORT || "6379";
const REDIS_PASSWORD = DotenvConfig.REDIS_PASSWORD;

interface RedisWithJsonOptions {
  host: string;
  port: number | string;
  password?: string;
  retry_strategy?: (retries: number) => number;
}

class RedisWithJson {
  private _client: RedisClientType;
  private _ready: boolean;

  constructor(options: RedisWithJsonOptions) {
    const redisConfig: RedisClientOptions = {
      socket: {
        host: options.host,
        port: Number(options.port),
        reconnectStrategy:
          options.retry_strategy ||
          ((retries: number) => Math.min(retries * 100, 3000)),
      },
    };

    if (options.password) {
      redisConfig.password = options.password;
    }

    this._client = redis.createClient(redisConfig) as RedisClientType;
    this._ready = false;

    this._client.on("connect", () => {
      console.log("Redis: connected");
    });

    this._client.on("ready", () => {
      console.log("Redis: ready");
      this._ready = true;
    });

    this._client.on("end", () => {
      console.log("Redis: end");
      this._ready = false;
    });

    this._client.on("reconnecting", () => {
      console.log("Redis: reconnecting");
      this._ready = false;
    });

    this._client.on("error", (error: Error) => {
      console.error("Redis: error", error);
    });

    // Auto-connect
    this._client.connect().catch(console.error);
  }

  async hget(key: string, field: string): Promise<any> {
    try {
      const result = await this._client.hGet(key || "", field || "");
      return result ? JSON.parse(result) : {};
    } catch (error) {
      console.log(`Redis hget error [${key}.${field}]:`, error);
      return {};
    }
  }

  async hgetall<T = Record<string, unknown>>(key: string): Promise<T> {
    try {
      const result = await this._client.hGetAll(key || "");
      if (!result || Object.keys(result).length === 0) return {} as T;

      return Object.keys(result).reduce(
        (accumulator: Record<string, unknown>, current: string) => {
          try {
            accumulator[current] = JSON.parse(result[current]);
          } catch {
            accumulator[current] = result[current];
          }
          return accumulator;
        },
        {},
      ) as T;
    } catch (error) {
      console.log(`Redis hgetall error [${key}]:`, error);
      return {} as T;
    }
  }

  async hset(
    key: string,
    field: string,
    data: any,
    recurse: string[] = [],
  ): Promise<void> {
    try {
      if (!key || !field) {
        return;
      }
      const existing = await this.hget(key, field);
      if (recurse.length) {
        recurse.forEach((k) => {
          (data as any)[k] = {
            ...(existing[k] || {}),
            ...((data as any)[k] || {}),
          };
        });
      }
      await this._client.hSet(
        key || "",
        field || "",
        JSON.stringify({ ...(existing ?? {}), ...(data ?? {}) }),
      );
    } catch (error) {
      console.log(`Redis hset error [${key}.${field}]:`, error);
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    try {
      if (fields.length > 0) {
        await this._client.hDel(key || "", fields);
      }
    } catch (error) {
      console.log(`Redis hdel error [${key}]:`, error);
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this._client.del(key);
    } catch (error) {
      console.log(`Redis del error [${key}]:`, error);
      return 0;
    }
  }

  async acquireLock(key: string, ttl: number = 5): Promise<boolean> {
    try {
      const result = await this._client.set(key, "1", {
        NX: true,
        EX: ttl,
      });
      return result === "OK";
    } catch (error) {
      console.log(`Redis acquireLock error [${key}]:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number | null> {
    try {
      return await this._client.ttl(key);
    } catch (error) {
      console.log(`Redis TTL error for key ${key}`, error);
      return null;
    }
  }

  async releaseLock(key: string): Promise<number> {
    return await this.del(key);
  }

  async disconnect(): Promise<void> {
    try {
      await this._client.quit();
      this._ready = false;
    } catch (error) {
      console.log("Redis disconnect error:", error);
    }
  }

  get ready(): boolean {
    return this._ready;
  }
}

const client = new RedisWithJson({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  retry_strategy: (retry: number) => retry * 100 || 3000,
});

export { client, RedisWithJson };
