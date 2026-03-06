require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const run = async () => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        const users = await pool.query("SELECT id FROM users WHERE email = 'raju@example.com'");
        if (users.rows.length === 0) { console.log('User raju not found'); return; }
        const userId = users.rows[0].id;

        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'learnflow_secret_key_2024');

        const course = await pool.query("SELECT id FROM courses WHERE slug = 'java-programming'");
        const courseId = course.rows[0].id;

        const enroll = await fetch(`http://127.0.0.1:5000/api/enrollments/${courseId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const enrollData = await enroll.json();
        console.log('Enroll status:', enroll.status, enrollData);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}
run();
