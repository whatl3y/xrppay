import DatabaseModel from './DatabaseModel'
import PostgresSqlParser from '../PostgresSqlParser'

export default function PrivacyCardTransactions(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'privacy_card_transactions')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'privacy_card_id',
        'transaction_token',
        'amount_cents',
        'settled_amount_cents',
        'status',
        'result',
        'transaction_created_at',
        'merchant_descriptor',
        'merchant_city',
        'merchant_state',
        'merchant_country'
      ],

      async getPage(userId, page=1, perPage=20) {
        return await PostgresSqlParser().runPaginationQuery(postgres, `
          select
            c.*,
            t.*
          from privacy_card_transactions as t
          inner join privacy_cards as c on c.id = t.privacy_card_id
          where
            c.user_id = $1 and
            t.result = 'APPROVED' -- TODO: Add result filter
          order by
            t.transaction_created_at desc
        `, [ userId ], page, perPage)
      }
    }
  )
}
