import {
  pgTable,
  integer,
  serial,
  char,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core'

export const clients = pgTable('clients', {
  id: integer('id').primaryKey().notNull(),
  accountLimit: integer('account_limit').notNull(),
  balance: integer('balance').default(0).notNull(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey().notNull(),
  clientId: integer('client_id')
    .notNull()
    .references(() => clients.id),
  amount: integer('amount').notNull(),
  operation: char('operation', { length: 1 }).notNull(),
  description: varchar('description', { length: 10 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})
