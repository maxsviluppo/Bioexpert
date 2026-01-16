import pg from 'pg';
import { put } from '@vercel/blob';

const { Pool } = pg;

export const config = {
    runtime: 'nodejs',
};

export default async function handler(request, response) {
    const connectionString = process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) return response.status(500).json({ error: 'DB Config Missing' });

    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    if (request.method === 'DELETE') {
        try {
            const body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
            const { username } = body;
            if (!username) return response.status(400).json({ error: 'Username required' });

            await pool.query('DELETE FROM leaderboard WHERE username = $1', [username]);
            return response.status(200).json({ success: true });
        } catch (e) {
            return response.status(500).json({ error: e.message });
        } finally {
            await pool.end();
        }
    }

    if (request.method !== 'POST') {
        await pool.end();
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = request.body;
        const { username, score, imageBase64, plantName, challengeId } = typeof body === 'string' ? JSON.parse(body) : body;

        if (!username || !score || !imageBase64) {
            await pool.end();
            return response.status(400).json({ success: false, error: 'Dati mancanti' });
        }

        // 1. Upload Immagine
        let imageUrl = '';
        try {
            const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
            if (process.env.BLOB_READ_WRITE_TOKEN) {
                const blob = await put(`beauty/${username}-${Date.now()}.jpg`, buffer, { access: 'public' });
                imageUrl = blob.url;
            } else {
                if (imageBase64.length < 100000) imageUrl = imageBase64;
            }
        } catch (blobError) {
            console.warn("Blob upload failed:", blobError.message);
            imageUrl = imageBase64.length < 100000 ? imageBase64 : '';
        }

        // 2. Salvataggio Punteggio (Upsert logic: cancella precedente e inserisci nuovo)
        await pool.query('BEGIN');

        // Elimina punteggi precedenti per questa sfida
        await pool.query(
            'DELETE FROM leaderboard WHERE username = $1 AND (challenge_id = $2 OR (challenge_id IS NULL AND $2 = \'beauty_contest\'))',
            [username, challengeId || 'beauty_contest']
        );

        // Inserisci il nuovo punteggio
        await pool.query(
            'INSERT INTO leaderboard (username, score, image_url, plant_name, challenge_id) VALUES ($1, $2, $3, $4, $5)',
            [username, score, imageUrl, plantName || null, challengeId || 'beauty_contest']
        );

        await pool.query('COMMIT');
        return response.status(200).json({ success: true, data: { url: imageUrl } });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Save Score Error:', error);
        return response.status(500).json({ success: false, error: error.message });
    } finally {
        await pool.end();
    }
}
