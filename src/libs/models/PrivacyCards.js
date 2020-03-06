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
          spend_limit_duration: 'FOREVER',
          spend_limit: limit || 0,  // NOTE: limit is in cents
          state: state || 'PAUSED'
        })

        return await this.updateCardRecordFromPrivacyResponse(user.id, cardRes)
      },

      async updateCard(userId, {
        state,
        limit
      }) {
        const userCard = await this.findBy({ user_id: userId, is_active: true })
        const cardRes = await PrivacyAPI(config.privacy.apiKey).updateCard({
          card_token: userCard.card_token,
          state: state || 'OPEN',
          spend_limit: limit || 0 // NOTE: limit is in cents
        })
        return await this.updateCardRecordFromPrivacyResponse(userId, cardRes, userCard.id)
      },

      async updateCardRecordFromPrivacyResponse(userId, cardRes, cardId=null) {
        if (cardId) {
          const card = await this.findBy({ user_id: userId, id: cardId })
          if (!card)
            throw new Error(`No card with the ID provided.`)
          this.setRecord(card)
        }

        this.setRecord({
          user_id: userId,
          is_active: true,
          friendly_name: cardRes.memo || this.record.friendly_name,
          card_token: cardRes.token || this.record.card_token,
          card_number: cardRes.pan || this.record.card_number,
          cvv: cardRes.cvv || this.record.cvv,
          exp_month: cardRes.exp_month || this.record.exp_month,
          exp_year: cardRes.exp_year || this.record.exp_year,
          type: cardRes.type || this.record.type,
          state: cardRes.state || this.record.state,
          spend_limit_duration: cardRes.spend_limit_duration || this.record.spend_limit_duration,
          spend_limit: (typeof cardRes.spend_limit !== 'undefined') ? cardRes.spend_limit : this.record.spend_limit
        })
        const id = await this.save()
        return { ...this.record, id }
      }
    }
  )
}
