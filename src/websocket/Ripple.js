import SessionHandler from '../libs/SessionHandler'
import CryptoWallet from '../libs/models/CryptoWallet'

export default function Ripple({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })

  return {
    async rippleGetAddresses() {
      const userId = session.getLoggedInUserId()
      const wallets = await CryptoWallet(postgres).getAllBy({ user_id: userId, type: 'xrp' })

      socket.emit(`getRippleAddresses`, wallets)
    }
  }
}
