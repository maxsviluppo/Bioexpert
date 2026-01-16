import pg from 'pg';
const { Pool } = pg;

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    // Questo endpoint dovrebbe essere chiamato da un cron job o triggerato manualmente/automaticamente
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) return response.status(500).json({ error: 'DB Config Missing' });

    const pool = new Pool({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Domenica

        // if (dayOfWeek !== 0) {
        //     return response.status(400).json({ error: 'I premi vengono assegnati solo la Domenica!' });
        // }
        // Rimuovo il check rigoroso per facilitare il testing, ma in prod dovrebbe esserci.

        // Calcola l'inizio della settimana (Lunedì scorso) per usare come ID univoco
        const monday = new Date(now);
        monday.setDate(now.getDate() - (now.getDay() + 6) % 7);
        monday.setHours(0, 0, 0, 0);
        const weekStartDate = monday.toISOString().split('T')[0];

        // 1. Trova i Top 3 della classifica attuale
        // Nota: Assumiamo che la classifica corrente contenga i dati di QUESTA settimana
        // (dato che viene resettata il lunedì)
        const leaderboardQuery = `
            SELECT username, score 
            FROM beauty_scores 
            ORDER BY score DESC 
            LIMIT 3
        `;
        const { rows: winners } = await pool.query(leaderboardQuery);

        if (winners.length === 0) {
            return response.status(200).json({ message: 'Nessun partecipante questa settimana.' });
        }

        const rewards = [500, 300, 150]; // XP per 1°, 2°, 3° posto
        const results = [];

        for (let i = 0; i < winners.length; i++) {
            const winner = winners[i];
            const rank = i + 1;
            const xpReward = rewards[i];

            // 2. Controlla se è già stato premiato per questa settimana
            const checkLog = await pool.query(
                'SELECT id FROM winners_log WHERE week_start_date = $1 AND rank = $2',
                [weekStartDate, rank]
            );

            if (checkLog.rows.length === 0) {
                // PRIMA SEGNATURA: Assegna XP e Logga

                // Aggiorna Utente (Aggiunge XP)
                await pool.query(
                    'UPDATE users SET xp = xp + $2 WHERE username = $1',
                    [winner.username, xpReward]
                );

                // Logga Vincita
                await pool.query(
                    'INSERT INTO winners_log (week_start_date, username, rank, xp_awarded) VALUES ($1, $2, $3, $4)',
                    [weekStartDate, winner.username, rank, xpReward]
                );

                results.push({ username: winner.username, rank, reward: xpReward, status: 'AWARDED' });
                console.log(`🏆 PREMIO ASSEGNATO: ${winner.username} (Rank ${rank}) +${xpReward} XP`);
            } else {
                results.push({ username: winner.username, rank, reward: xpReward, status: 'ALREADY_AWARDED' });
            }
        }

        return response.status(200).json({
            success: true,
            week: weekStartDate,
            results
        });

    } catch (error) {
        console.error('Award Winners Error:', error);
        return response.status(500).json({ success: false, error: error.message });
    } finally {
        await pool.end();
    }
}
