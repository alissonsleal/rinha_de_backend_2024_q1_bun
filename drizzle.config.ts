import type { Config } from 'drizzle-kit'

export default {
  out: './src/db/migrations',
  schema: './src/db/migrations/schema.ts',
  driver: 'pg',
  dbCredentials: {
    connectionString: import.meta.env.DATABASE_URL || '',
  },
} satisfies Config
