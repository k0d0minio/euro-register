import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;
let cached: Db | undefined;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Lazy, so that pages with no data (sign-in, preview) work with no DATABASE_URL. */
export function db(): Db {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}

export * from "./schema";
