import { createClient, Client } from '@libsql/client';

let _db: Client | null = null;

export function getDb(): Client {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL;
    const token = process.env.TURSO_AUTH_TOKEN;
    if (!url) {
      throw new Error('TURSO_DATABASE_URL is not set');
    }
    _db = createClient({ url, authToken: token || '' });
  }
  return _db;
}

export async function initDB() {
  const db = getDb();
  await db.execute(`CREATE TABLE IF NOT EXISTS channels (
    channel_id TEXT PRIMARY KEY, handle TEXT, name TEXT,
    subscriber_count INTEGER DEFAULT 0, uploads_playlist_id TEXT, last_synced_at TEXT)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS content_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT, channel_id TEXT NOT NULL, channel_name TEXT NOT NULL,
    video_id TEXT NOT NULL, title TEXT, thumbnail_url TEXT, published_at TEXT,
    duration_seconds INTEGER DEFAULT 0, views INTEGER DEFAULT 0, likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0, engagement_rate REAL DEFAULT 0,
    synced_at TEXT DEFAULT (datetime('now')), UNIQUE(channel_id, video_id))`);
  await db.execute(`CREATE TABLE IF NOT EXISTS daily_views (
    date TEXT NOT NULL, channel_id TEXT NOT NULL, total_views INTEGER DEFAULT 0,
    PRIMARY KEY (date, channel_id))`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_channel ON content_analytics(channel_id)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_published ON content_analytics(published_at)`);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_views ON content_analytics(views DESC)`);
  console.log('Database initialized successfully');
}
