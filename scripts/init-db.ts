import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  await db.execute(`CREATE TABLE IF NOT EXISTS channels (
    channel_id TEXT PRIMARY KEY, handle TEXT, name TEXT,
    subscriber_count INTEGER DEFAULT 0, uploads_playlist_id TEXT, last_synced_at TEXT)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS content_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT, channel_id TEXT NOT NULL, channel_name TEXT NOT NULL,
    video_id TEXT NOT NULL, title TEXT, thumbnail_url TEXT, published_at TEXT,
    duration_seconds INTEGER DEFAULT 0, views INTEGER DEFAULT 0, likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0, engagement_rate REAL DEFAULT 0,
    synced_at TEXT DEFAULT (datetime('now')), UNIQUE(channel_id, video_id))`);
  console.log('Database initialized!');
}

main().catch(console.error);
