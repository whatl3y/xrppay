import DatabaseModel from './DatabaseModel'

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
      ]
    }
  )
}
