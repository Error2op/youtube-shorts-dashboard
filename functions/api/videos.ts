import { getDb, Env } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const channelId = url.searchParams.get('channelId') || '';
  const sortBy = url.searchParams.get('sortBy') || 'views';
  const days = parseInt(url.searchParams.get('days') || '30', 10);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  try {
    const db = getDb(context.env);
    let query = `SELECT * FROM content_analytics WHERE published_at >= ?`;
    const args: any[] = [sinceStr];

    if (channelId) {
      query += ` AND channel_id = ?`;
      args.push(channelId);
    }

    const allowedSort = ['views', 'likes', 'comments', 'engagement_rate'];
    const orderBy = allowedSort.includes(sortBy) ? sortBy : 'views';
    query += ` ORDER BY ${orderBy} DESC LIMIT 50`;

    const result = await db.execute({ sql: query, args });
    return Response.json(result.rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
