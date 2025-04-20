import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { STUDY_TYPE_CONTENT_TABLE } from './schema';

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_CONNECTION_STRING);
export const db = drizzle(sql);

// Add a test query to verify connection
export async function testConnection() {
    try {
        // Basic SQL query that doesn't rely on specific tables
        const result = await sql`SELECT 1 as connection_test`;
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
