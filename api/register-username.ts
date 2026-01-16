import pg from 'pg';
const { Pool } = pg;

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = request.body;
        const username = typeof body === 'string' ? JSON.parse(body).username : body.username;

        console.log('👤 [API] Register:', username);

        if (!username || username.length < 3) {
            return response.status(400).json({ success: false, error: 'Username troppo corto' });
        }

        const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
        if (!connectionString) {
            console.error('❌ Missing DB Config');
            return response.status(500).json({ success: false, error: 'DB Config Missing' });
        }

        const pool = new Pool({
            connectionString: connectionString,
            ssl: { rejectUnauthorized: false }
        });

        try {
            // Check existing
            const check = await pool.query('SELECT username FROM users WHERE username = $1', [username]);

            if (check.rows.length > 0) {
                // Modifica per permettere "Login" semplificato su richiesta utente
                // Invece di errore, ritorniamo successo ma segnaliamo che esisteva gia
                console.log('✅ User already exists, logging in:', username);
                return response.status(200).json({ success: true, username, isLogin: true });
            }

            // Create
            await pool.query('INSERT INTO users (username) VALUES ($1)', [username]);
            console.log('✅ User created:', username);

            return response.status(200).json({ success: true, username });

        } finally {
            await pool.end();
        }

    } catch (error) {
        console.error('❌ API Error:', error);
        return response.status(500).json({ success: false, error: error.message });
    }
}
