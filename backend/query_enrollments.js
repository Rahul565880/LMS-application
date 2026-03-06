require('dotenv').config();
const { Pool } = require('pg');

const run = async () => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        const enrollments = await pool.query('SELECT * FROM enrollments');
        console.log('Enrollments:', enrollments.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}
run();
