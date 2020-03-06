import request from 'request-promise-native'
import PrivacyAPI from '../libs/PrivacyAPI'
import PrivacyCards from '../libs/models/PrivacyCards'
import config from '../config'

export default function PrivacyWorkers({ log, postgres, redis }) {
  return {
    privacyLockCard: {
      plugins: [ 'Retry' ],
      pluginOptions: {
        retry: {
          retryLimit: 5,
          retryDelay: 1000 * 5,
        }
      },
      perform: async options => {
        const cardId = options.cardId
        const userId = options.userId
        const cards = PrivacyCards(postgres)

        // TODO: Get card info from Privacy and make sure it's not already
        // CLOSED from being used, then proceed to PAUSE if it hasn't
        const cardRecord = await cards.findBy({ user_id: userId, is_active: true, id: cardId })
        if (!cardRecord)
          return log.info(`This card is no longer active, nothing to do.`)
        
        const [ card ] = await PrivacyAPI(config.privacy.apiKey).listCards({ card_token: cardRecord.card_token })
        if (card.state === 'OPEN')
          await cards.updateCard(userId, { limit: 0, state: 'PAUSED' })

        await request.get(`${config.server.host}/api/1.0/user/client/reset?id=${userId}`)
      }
    }
  }
}
