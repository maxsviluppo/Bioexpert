import pg from 'pg';
const { Pool } = pg;

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) return response.status(500).json({ error: 'DB Config Missing' });

    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        const { limit = '100', challengeId = 'beauty_contest', period = 'all' } = request.query || {};

        let timeFilter = '';
        const now = new Date();

        if (period === 'today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            timeFilter = `AND created_at >= '${today.toISOString()}'`;
        } else if (period === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            timeFilter = `AND created_at >= '${weekAgo.toISOString()}'`;
        }

        const result = await pool.query(`
            SELECT username, score, image_url, created_at, plant_name, challenge_id
            FROM leaderboard
            WHERE (challenge_id = $2 OR ($2 = 'beauty_contest' AND (challenge_id IS NULL OR challenge_id = 'beauty_contest'))) 
            ${timeFilter}
            ORDER BY score DESC
            LIMIT $1
        `, [parseInt(limit as string), challengeId]);

        response.setHeader('Cache-Control', 'public, s-maxage=5, stale-while-revalidate=5');
        return response.status(200).json({
            success: true,
            leaderboard: result.rows
        });

    } catch (error) {
        console.error('Leaderboard Error:', error);
        return response.status(500).json({ success: false, error: error.message });
    } finally {
        await pool.end();
    }
}
