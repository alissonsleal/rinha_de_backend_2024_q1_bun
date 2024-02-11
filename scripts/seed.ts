import { db } from '../src/db'
import { clients, transactions } from '../src/db/migrations/schema'

console.log('Deleting current data...')
try {
  await db.delete(transactions)
  await db.delete(clients)
} catch (err) {
  console.log(err)
  console.log('Could not delete existing data before seeding ❌')
  process.exit(1)
}

console.log('Fetching existing data...')
try {
  const result = await db.select().from(clients)
  if (result.length) {
    console.log('Data already exists, seeding aborted ❌')
    process.exit(0)
  }
} catch (err) {
  console.error(err)
  console.log('Could not fetch existing data ❌')
  process.exit(1)
}

console.log('Seeding data...')
try {
  await db.insert(clients).values([
    { id: 1, accountLimit: 100000, balance: 0 },
    { id: 2, accountLimit: 80000, balance: 0 },
    { id: 3, accountLimit: 1000000, balance: 0 },
    { id: 4, accountLimit: 10000000, balance: 0 },
    { id: 5, accountLimit: 500000, balance: 0 },
  ])
  console.log('Data seeded successfully ✅')
} catch (err) {
  console.error(err)
  console.log('Could not seed data ❌')
}

console.log('Seeding completed ✅')
process.exit(0)
