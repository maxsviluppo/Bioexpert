import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) return response.status(500).json({ error: 'DB Config Missing' });

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;

        // REGISTER
        if (request.method === 'POST' && body.action === 'register') {
            const { username, password, email } = body;

            if (!username || !password) {
                return response.status(400).json({ error: 'Username e password richiesti' });
            }

            // Validazione username (alfanumerico, 3-20 caratteri)
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                return response.status(400).json({
                    error: 'Username non valido (3-20 caratteri, solo lettere, numeri e _)'
                });
            }

            // Validazione password (minimo 6 caratteri)
            if (password.length < 6) {
                return response.status(400).json({ error: 'Password troppo corta (minimo 6 caratteri)' });
            }

            // Validazione email opzionale
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return response.status(400).json({ error: 'Email non valida' });
            }

            // Ensure table exists with new schema
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    email VARCHAR(255),
                    xp INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT NOW(),
                    last_login TIMESTAMP
                )
            `);

            // Check if username exists
            const existing = await pool.query(
                'SELECT id FROM users WHERE username = $1',
                [username]
            );

            if (existing.rows.length > 0) {
                return response.status(409).json({ error: 'Username già in uso' });
            }

            // Check if email exists (if provided)
            if (email) {
                const existingEmail = await pool.query(
                    'SELECT id FROM users WHERE email = $1',
                    [email]
                );

                if (existingEmail.rows.length > 0) {
                    return response.status(409).json({ error: 'Email già registrata' });
                }
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Insert user
            const result = await pool.query(
                `INSERT INTO users (username, password_hash, email) 
                 VALUES ($1, $2, $3) 
                 RETURNING id, username, email, xp, level, created_at`,
                [username, passwordHash, email || null]
            );

            return response.status(201).json({
                success: true,
                user: result.rows[0]
            });
        }

        // LOGIN
        if (request.method === 'POST' && body.action === 'login') {
            const { username, password } = body;

            if (!username || !password) {
                return response.status(400).json({ error: 'Username e password richiesti' });
            }

            // Get user
            const result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            if (result.rows.length === 0) {
                return response.status(401).json({ error: 'Credenziali non valide' });
            }

            const user = result.rows[0];

            // Verify password
            const isValid = await bcrypt.compare(password, user.password_hash);

            if (!isValid) {
                return response.status(401).json({ error: 'Credenziali non valide' });
            }

            // Update last login
            await pool.query(
                'UPDATE users SET last_login = NOW() WHERE id = $1',
                [user.id]
            );

            return response.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    xp: user.xp,
                    level: user.level
                }
            });
        }

        // REQUEST PASSWORD RESET
        if (request.method === 'POST' && body.action === 'request_reset') {
            const { email } = body;

            if (!email) {
                return response.status(400).json({ error: 'Email richiesta' });
            }

            const result = await pool.query(
                'SELECT username FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                // Non rivelare se l'email esiste o no (sicurezza)
                return response.status(200).json({
                    success: true,
                    message: 'Se l\'email è registrata, riceverai le istruzioni'
                });
            }

            // TODO: Implementare invio email con token
            // Per ora, restituiamo solo il messaggio di successo
            return response.status(200).json({
                success: true,
                message: 'Istruzioni inviate via email',
                // TEMP: per testing, mostra username
                debug_username: result.rows[0].username
            });
        }

        return response.status(400).json({ error: 'Azione non valida' });

    } catch (e) {
        console.error('Auth Error:', e);
        return response.status(500).json({ success: false, error: e.message });
    } finally {
        await pool.end();
    }
}
