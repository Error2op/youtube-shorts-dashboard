import { getDb, Env } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = getDb(context.env);
    const result = await db.execute(
      `SELECT channel_id, handle, name, subscriber_count, last_synced_at FROM channels ORDER BY name`
    );
    return Response.json(result.rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
