import DatabaseModel from './DatabaseModel'

export default function PrivacyCards(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'privacy_cards')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'user_id',
        'is_active',
        'friendly_name',
        'card_token',
        'card_number',
        'cvv',
        'exp_month',
        'exp_year',
        'hostname',
        'type',
        'state',
        'spend_limit_duration',
        'spend_limit'             // amount in cents
      ]
    }
  )
}
