import SessionHandler from '../libs/SessionHandler'
import PrivacyAPI from '../libs/PrivacyAPI'
import PrivacyCards from '../libs/models/PrivacyCards'
import config from '../config'

export default function Privacy({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })

  return {
    async privacyGetActiveCard() {
      const user = session.getLoggedInUserId(true)
      const priv = PrivacyCards(postgres)

      let card = await priv.findBy({ user_id: user.id, is_active: true })

      // initialize user's first card
      // TODO: Need to make sure the user has funded her account before creating a new card
      // if (!card) {
      //   const cardRes = await PrivacyAPI(config.privacy.apiKey).createCard({
      //     type: 'SINGLE_USE',
      //     memo: `${user.name || user.username_email}'s Card`,
      //     spend_limit_duration: 'TRANSACTION',
      //     state: 'PAUSED'
      //   })

      //   priv.setRecord({
      //     user_id: user.id,
      //     is_active: true,
      //     friendly_name: cardRes.memo,
      //     card_token: cardRes.token,
      //     card_number: cardRes.pan,
      //     cvv: cardRes.cvv,
      //     exp_month: cardRes.exp_month,
      //     exp_year: cardRes.exp_year,
      //     type: cardRes.type,
      //     state: cardRes.state,
      //     spend_limit_duration: cardRes.spend_limit_duration,
      //     spend_limit: cardRes.spend_limit
      //   })
      //   const id = await priv.save()

      //   card = { ...priv.record, id }
      // }

      socket.emit(`getPrivacyActiveCard`, card)
    }
  }
}
