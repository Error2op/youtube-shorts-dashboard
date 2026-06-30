import { getDb, Env } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = getDb(context.env);

    const result = await db.execute({
      sql: `
        SELECT dv.date, dv.channel_id, c.name as channel_name, dv.total_views
        FROM daily_views dv
        JOIN channels c ON dv.channel_id = c.channel_id
        ORDER BY dv.date ASC, dv.total_views DESC
      `,
    });

    const totals = await db.execute({
      sql: `
        SELECT date, SUM(total_views) as total_views
        FROM daily_views
        GROUP BY date
        ORDER BY date ASC
      `,
    });

    return Response.json({ channels: result.rows, totals: totals.rows });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
