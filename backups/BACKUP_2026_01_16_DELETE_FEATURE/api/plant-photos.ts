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

    if (request.method === 'GET') {
        try {
            const { plant_id } = request.query;
            if (!plant_id) return response.status(400).json({ error: 'Plant ID required' });

            const result = await pool.query(
                'SELECT * FROM plant_photos WHERE plant_id = $1 ORDER BY taken_at DESC',
                [plant_id]
            );

            return response.status(200).json({ success: true, data: result.rows });
        } catch (e) {
            return response.status(500).json({ error: e.message });
        } finally {
            await pool.end();
        }
    }

    if (request.method === 'POST') {
        try {
            const { plant_id, imageBase64, notes, health_score } = request.body;

            if (!plant_id || !imageBase64) {
                return response.status(400).json({ success: false, error: 'Dati mancanti' });
            }

            // 1. Blob Upload
            const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
            const blob = await put(`plants/${plant_id}/update-${Date.now()}.jpg`, buffer, { access: 'public' });

            // 2. DB Insert
            const res = await pool.query(
                'INSERT INTO plant_photos (plant_id, photo_url, notes, health_score) VALUES ($1, $2, $3, $4) RETURNING *',
                [plant_id, blob.url, notes, health_score]
            );

            // 3. Update last_care_at and potentially image_url of the main plant
            await pool.query(
                'UPDATE user_plants SET last_care_at = NOW(), image_url = $1 WHERE id = $2',
                [blob.url, plant_id]
            );

            return response.status(200).json({ success: true, data: res.rows[0] });
        } catch (error) {
            console.error('Save Photo Error:', error);
            return response.status(500).json({ success: false, error: error.message });
        } finally {
            await pool.end();
        }
    }

    if (request.method === 'DELETE') {
        try {
            const { id } = request.body; // or query
            if (!id) return response.status(400).json({ error: 'Photo ID required' });

            const result = await pool.query(
                'DELETE FROM plant_photos WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rowCount === 0) {
                return response.status(404).json({ success: false, error: 'Photo not found' });
            }

            return response.status(200).json({ success: true, data: result.rows[0] });
        } catch (e) {
            return response.status(500).json({ error: e.message });
        } finally {
            await pool.end();
        }
    }

    return response.status(405).json({ error: 'Method not allowed' });
}
