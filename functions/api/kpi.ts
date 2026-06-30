import { getDb, Env } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const channelId = url.searchParams.get('channelId') || '';
  const days = parseInt(url.searchParams.get('days') || '30', 10);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  try {
    const db = getDb(context.env);
    let query = `
      SELECT 
        SUM(views) as total_views,
        AVG(views) as avg_views,
        AVG(engagement_rate) as avg_engagement,
        COUNT(*) as shorts_count,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments
      FROM content_analytics
      WHERE published_at >= ?
    `;
    const args: any[] = [sinceStr];

    if (channelId) {
      query += ` AND channel_id = ?`;
      args.push(channelId);
    }

    const result = await db.execute({ sql: query, args });
    return Response.json(result.rows[0] || {});
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
