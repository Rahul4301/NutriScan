import mysql from 'mysql2/promise';

// Create a connection pool
export const db = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'nutriscan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Example query function
export async function testConnection() {
  const [rows] = await db.query('SELECT 1 + 1 AS result');
  return rows;
}
