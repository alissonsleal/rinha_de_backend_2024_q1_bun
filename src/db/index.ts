import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL,
  max: 30,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export const db = drizzle(pool)
