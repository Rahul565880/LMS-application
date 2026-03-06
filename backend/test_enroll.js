const userId = '1155504645584093185';
const courseId = '1155506653476093953';
require('dotenv').config();
const { Pool } = require('pg');

const run = async () => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        console.log('Inserting enrollment');
        const result = await pool.query(
            'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *',
            [userId, courseId]
        );
        console.log(result.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}
run();
