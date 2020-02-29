import DatabaseModel from './DatabaseModel'
import PrivacyAPI from '../PrivacyAPI'
import config from '../../config'

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
      ],

      async createCard(user, {
        type,
        memo,
        limit,
        state
      }={}) {
        const cardRes = await PrivacyAPI(config.privacy.apiKey).createCard({
          type: type || 'SINGLE_USE',
          memo: memo || `${user.name || user.username_email}'s Card`,
          spend_limit_duration: 'TRANSACTION',
          spend_limit: limit || 0,
          state: state || 'PAUSED'
        })

        this.setRecord({
          user_id: user.id,
          is_active: true,
          friendly_name: cardRes.memo,
          card_token: cardRes.token,
          card_number: cardRes.pan,
          cvv: cardRes.cvv,
          exp_month: cardRes.exp_month,
          exp_year: cardRes.exp_year,
          type: cardRes.type,
          state: cardRes.state,
          spend_limit_duration: cardRes.spend_limit_duration,
          spend_limit: cardRes.spend_limit
        })
        const id = await this.save()
        return { ...this.record, id }
      }
    }
  )
}
