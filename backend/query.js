require('dotenv').config();
const { Pool } = require('pg');

const run = async () => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        const courses = await pool.query('SELECT id, title, is_published, slug FROM courses');
        console.log('Courses:', courses.rows);
        const users = await pool.query('SELECT id, name, role FROM users');
        console.log('Users:', users.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}
run();
