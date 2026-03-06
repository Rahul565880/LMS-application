require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const run = async () => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('Inserting user raju');
        // We insert raju using the exact ID so his JWT works and he doesn't need to relogin
        await pool.query(
            "INSERT INTO users (id, name, email, password, role) VALUES ($1, 'raju', 'raju@example.com', $2, 'student') ON CONFLICT (id) DO NOTHING",
            ['1155504645584093185', hashedPassword]
        );
        console.log('Restored raju student account');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}
run();
