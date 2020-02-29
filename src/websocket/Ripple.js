// import RippleClient from '../libs/RippleClient'
import SessionHandler from '../libs/SessionHandler'
import CryptoWallet from '../libs/models/CryptoWallet'
import config from '../config'

export default function Ripple({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })

  return {
    async rippleGetAddress() {
      const wallet = CryptoWallet(postgres)
      const userId = session.getLoggedInUserId()
      let userWallet = await wallet.findOrCreateBy({ user_id: userId, type: 'xrp' })
      if (wallet.isNewRecord) {
        wallet.setRecord({
          user_id: userId,
          type: 'xrp',
          public_addr: config.ripple.masterAddr,
          private_key: null,
          mod1: userId,                         // XRP tag
          mod2: config.ripple.masterClassicAddr // classic XRP address
        })
        await wallet.save()
        userWallet = wallet.record
      }

      socket.emit(`setRippleAddress`, userWallet)
    }
  }
}
