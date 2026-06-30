export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();

    // Get all daily_views ordered by date
    const result = await db.execute({
      sql: `
        SELECT dv.date, dv.channel_id, c.name as channel_name, dv.total_views
        FROM daily_views dv
        JOIN channels c ON dv.channel_id = c.channel_id
        ORDER BY dv.date ASC, dv.total_views DESC
      `,
    });

    // Also get total per date
    const totals = await db.execute({
      sql: `
        SELECT date, SUM(total_views) as total_views
        FROM daily_views
        GROUP BY date
        ORDER BY date ASC
      `,
    });

    return NextResponse.json({
      channels: result.rows,
      totals: totals.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
