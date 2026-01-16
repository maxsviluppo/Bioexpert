import pg from 'pg';
import { put } from '@vercel/blob';

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
        // GET: Recupera lista piante
        if (request.method === 'GET') {
            const { username } = request.query;
            if (!username) return response.status(400).json({ error: 'Username required' });

            const result = await pool.query(`
                SELECT * FROM user_plants 
                WHERE username = $1 
                ORDER BY created_at DESC
            `, [username]);

            return response.status(200).json({ success: true, data: result.rows });
        }

        // POST: Aggiungi nuova pianta
        if (request.method === 'POST') {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const { username, plant_name, scientific_name, location, imageBase64, diagnosis, watering, sunlight, pruning, repotting } = body;

            if (!username || !plant_name) return response.status(400).json({ error: 'Dati mancanti' });

            // Verifica utente
            const userCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
            if (userCheck.rows.length === 0) return response.status(404).json({ error: 'User not registered' });

            let imageUrl = null;
            if (imageBase64 && imageBase64.startsWith('data:image')) {
                try {
                    // Tenta upload su Vercel Blob se configurato
                    if (process.env.BLOB_READ_WRITE_TOKEN) {
                        const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
                        const blob = await put(`plants/${username}-${Date.now()}.jpg`, buffer, {
                            access: 'public',
                            token: process.env.BLOB_READ_WRITE_TOKEN
                        });
                        imageUrl = blob.url;
                    } else {
                        // Fallback: Salva Base64 nel DB se sotto i 4MB (limite Vercel/Postgres safe)
                        if (imageBase64.length < 4000000) {
                            imageUrl = imageBase64;
                        }
                    }
                } catch (blobError) {
                    console.error('Blob upload error:', blobError);
                    // Fallback se Blob fallisce
                    if (imageBase64.length < 4000000) imageUrl = imageBase64;
                }
            }

            const result = await pool.query(`
                INSERT INTO user_plants (
                    username, plant_name, scientific_name, nickname, image_url, 
                    diagnosis, watering_guide, sunlight_guide, pruning_guide, repotting_guide,
                    created_at, next_check_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW() + INTERVAL '7 days')
                RETURNING *
            `, [
                username, plant_name, scientific_name, location, imageUrl,
                diagnosis, watering, sunlight, pruning, repotting
            ]);

            return response.status(201).json({ success: true, data: result.rows[0] });
        }

        // DELETE: Rimuovi pianta
        if (request.method === 'DELETE') {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const id = request.query.id || body?.id;
            const username = request.query.username || body?.username;

            if (!id || !username) {
                return response.status(400).json({ error: 'Dati richiesti mancanti: id or username' });
            }

            // Convert id to int if it's a string, to be safe with Postgres
            const plantId = typeof id === 'string' ? parseInt(id) : id;

            const result = await pool.query('DELETE FROM user_plants WHERE id = $1 AND username = $2 RETURNING id', [plantId, username]);

            if (result.rowCount === 0) {
                return response.status(404).json({ error: 'Pianta non trovata o non appartiene all\'utente' });
            }

            return response.status(200).json({ success: true });
        }

        // PATCH: Aggiorna (es. per cura)
        if (request.method === 'PATCH') {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const { username, id, last_care_at, next_check_at } = body;

            if (!id || !username) return response.status(400).json({ error: 'ID e Username richiesti' });

            const result = await pool.query(`
                UPDATE user_plants 
                SET 
                    last_care_at = COALESCE($1, last_care_at),
                    next_check_at = COALESCE($2, next_check_at)
                WHERE id = $3 AND username = $4
                RETURNING *
            `, [last_care_at, next_check_at, id, username]);

            return response.status(200).json({ success: true, data: result.rows[0] });
        }

        return response.status(405).json({ error: 'Method not allowed' });

    } catch (e) {
        console.error('API Error:', e);
        return response.status(500).json({ success: false, error: e.message });
    } finally {
        await pool.end();
    }
}
