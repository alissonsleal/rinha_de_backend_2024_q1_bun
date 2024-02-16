import { desc, eq, sql } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db } from './db'
import { clients, transactions } from './db/migrations/schema'

const app = new Elysia()
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION' || code === 'UNKNOWN') {
      set.status = 422

      return error?.message || 'Erro de validação'
    }
  })
  .get(
    '/clientes/:userId/extrato',
    async ({ params: { userId }, set }) => {
      const clientPromise = db
        .select({
          total: clients.balance,
          data_extrato: sql`now()`,
          limite: clients.accountLimit,
        })
        .from(clients)
        .where(eq(clients.id, userId))

      const lastTenTransactionsPromise = db
        .select({
          valor: transactions.amount,
          tipo: transactions.operation,
          descricao: transactions.description,
          realizada_em: transactions.createdAt,
        })
        .from(transactions)
        .where(eq(transactions.clientId, userId))
        .orderBy(desc(transactions.createdAt))
        .limit(10)

      const [client, lastTenTransactions] = await Promise.all([
        clientPromise,
        lastTenTransactionsPromise,
      ])

      if (!client.length) {
        set.status = 404

        return { error: 'Cliente não encontrado' }
      }

      return {
        saldo: client?.[0],
        ultimas_transacoes: lastTenTransactions,
      }
    },
    {
      params: t.Object({
        userId: t.Numeric(),
      }),
    }
  )
  .post(
    '/clientes/:userId/transacoes',
    async ({ params: { userId }, body, set }) => {
      const { valor, tipo, descricao } = body

      return await db.transaction(async (tx) => {
        const client = await tx
          .select({
            id: clients.id,
            balance: clients.balance,
            accountLimit: clients.accountLimit,
          })
          .from(clients)
          .where(eq(clients.id, userId))
          .for('update')

        if (!client.length) {
          set.status = 404

          return { error: 'Cliente não encontrado' }
        }

        const newBalance =
          tipo === 'd'
            ? client[0].balance - Math.abs(valor)
            : client[0].balance + Math.abs(valor)

        if (newBalance < client[0].accountLimit * -1) {
          set.status = 422

          return { error: 'Saldo insuficiente' }
        }

        const [_, updated] = await Promise.all([
          tx.insert(transactions).values({
            amount: valor,
            clientId: client[0].id,
            description: descricao,
            operation: tipo,
          }),
          tx
            .update(clients)
            .set({
              balance: sql`${clients.balance} ${
                tipo === 'd' ? sql.raw('-') : sql.raw('+')
              } ${Math.abs(valor)}`,
            })
            .where(eq(clients.id, client[0].id))
            .returning(),
        ])

        return {
          limite: client[0].accountLimit,
          saldo: updated[0].balance,
        }
      })
    },
    {
      body: t.Object({
        valor: t.Numeric({ multipleOf: 1 }),
        tipo: t.String({
          pattern: '^(d|c)$',
        }),
        descricao: t.String({
          maxLength: 10,
          minLength: 1,
        }),
      }),
      params: t.Object({
        userId: t.Numeric(),
      }),
    }
  )

  .listen(import.meta.env.APP_PORT || 8080)

console.log(`🐔 RINHA2024 is running at on port ${app.server?.port}...`)
