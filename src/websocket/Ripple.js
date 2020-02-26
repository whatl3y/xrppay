// import RippleClient from '../libs/RippleClient'
import SessionHandler from '../libs/SessionHandler'
import CryptoWallet from '../libs/models/CryptoWallet'
import config from '../config'

export default function Ripple({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })

  return {
    async rippleGetAddresses() {
      // const ripple = RippleClient()
      const wallet = CryptoWallet(postgres)
      const userId = session.getLoggedInUserId()
      let wallets = await wallet.getAllBy({ user_id: userId, type: 'xrp' })
      if (wallets.length === 0) {
        wallet.setRecord({
          user_id: userId,
          type: 'xrp',
          public_addr: config.ripple.masterAddr,
          private_key: null,
          mod1: userId,                         // XRP tag
          mod2: config.ripple.masterClassicAddr // classic XRP address
        })
        await wallet.save()
        wallets = await wallet.getAllBy({ user_id: userId, type: 'xrp' })
      }

      socket.emit(`getRippleAddresses`, wallets)
    }
  }
}
