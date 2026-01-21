require('dotenv').config({ path: '.env.test_check' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function backupData() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = path.join(process.cwd(), `database_data_backup_${timestamp}.sql`);

    const tables = [
        'users', 'user_plants', 'plant_care_programs', 'care_program_phases',
        'care_checkpoints', 'care_program_actions', 'care_events',
        'plant_photos', 'leaderboard', 'user_analyses'
    ];

    let sqlContent = `-- BIOEXPERT DATA BACKUP\n-- Generated on: ${new Date().toLocaleString()}\n\n`;

    try {
        const client = await pool.connect();

        for (const table of tables) {
            console.log(`Backing up table: ${table}...`);
            const res = await client.query(`SELECT * FROM ${table}`);

            if (res.rows.length === 0) {
                sqlContent += `-- Table ${table} is empty.\n\n`;
                continue;
            }

            sqlContent += `-- Data for ${table}\n`;
            for (const row of res.rows) {
                const columns = Object.keys(row).join(', ');
                const values = Object.values(row).map(val => {
                    if (val === null) return 'NULL';
                    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                    if (val instanceof Date) return `'${val.toISOString()}'`;
                    return val;
                }).join(', ');

                sqlContent += `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
            }
            sqlContent += '\n';
        }

        fs.writeFileSync(backupFile, sqlContent);
        console.log(`✅ Backup created: ${backupFile}`);
        client.release();
    } catch (err) {
        console.error('❌ Backup failed:', err);
    } finally {
        await pool.end();
    }
}

backupData();
