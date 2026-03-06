require('dotenv').config();
const { Pool } = require('pg');

const run = async () => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        const lessons = await pool.query('SELECT id, title, video_url, video_id FROM lessons');
        console.log('Lessons:', lessons.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}
run();
