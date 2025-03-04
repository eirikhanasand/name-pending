import dotenv from 'dotenv'
import pg from 'pg'
const { Pool } = pg

dotenv.config()

const { DB_USER, DB_HOST, DB, DB_PASSWORD } = process.env
if (!DB_USER || !DB_HOST || !DB || !DB_PASSWORD) {
    throw new Error("Missing one or more DB_ prefixed env variables.")
}

const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB,
    password: DB_PASSWORD,
    port: 5432,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 3000
})

export default async function run(query: string, params: string[]) {
    const client = await pool.connect()
    try {
        return await client.query(query, params)
    } catch (error) {
        throw error
    } finally {
        client.release()
    }
}
