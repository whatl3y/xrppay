import PrivacyCards from '../libs/models/PrivacyCards'
import config from '../config'

export default function PrivacyWorkers({ redis, postgres }) {
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
        const userId = options.userId
        await PrivacyCards(postgres).updateCard(userId, { limit: 0, state: 'PAUSED' })

        // TODO: send websocket or upstream request to update user
      }
    }
  }
}
