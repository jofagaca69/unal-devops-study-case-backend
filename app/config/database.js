import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'unal_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'unal_db',
  password: process.env.DB_PASSWORD || 'unal_password',
  port: process.env.DB_PORT || 5432,
});

export default pool; 