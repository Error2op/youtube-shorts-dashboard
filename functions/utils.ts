import { createClient } from '@libsql/client';

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  YOUTUBE_API_KEY: string;
}

export function getDb(env: Env) {
  return createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
}
