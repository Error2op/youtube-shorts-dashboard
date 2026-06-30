import { getDb, Env } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const days = parseInt(new URL(context.request.url).searchParams.get('days') || '30', 10);
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  try {
    const db = getDb(context.env);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const result = await db.execute({
      sql: `
        SELECT
          c.channel_id, c.name as channel_name, c.subscriber_count,
          COALESCE(SUM(ca.views), 0) as total_views,
          COALESCE(SUM(ca.likes), 0) as total_likes,
          COALESCE(SUM(ca.comments), 0) as total_comments,
          COUNT(ca.video_id) as shorts_count,
          COALESCE(AVG(ca.engagement_rate), 0) as avg_engagement,
          COALESCE(AVG(ca.views), 0) as avg_views
        FROM channels c
        LEFT JOIN content_analytics ca ON c.channel_id = ca.channel_id AND ca.published_at >= ?
        GROUP BY c.channel_id
        ORDER BY total_views DESC
      `,
      args: [sinceStr],
    });

    const dvResult = await db.execute({
      sql: `SELECT channel_id, date, total_views FROM daily_views WHERE date IN (?, ?)`,
      args: [today, yesterday],
    });

    const dailyMap: Record<string, { today: number; yesterday: number }> = {};
    for (const row of dvResult.rows as any[]) {
      const cid = row.channel_id;
      if (!dailyMap[cid]) dailyMap[cid] = { today: 0, yesterday: 0 };
      const views = parseInt(row.total_views as string, 10) || 0;
      if (row.date === today) dailyMap[cid].today = views;
      if (row.date === yesterday) dailyMap[cid].yesterday = views;
    }

    const rows = (result.rows as any[]).map((row: any) => {
      const d = dailyMap[row.channel_id as string] || { today: 0, yesterday: 0 };
      return { ...row, today_views: d.today, yesterday_views: d.yesterday, daily_gain: d.today - d.yesterday };
    });

    return Response.json(rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
