// import RippleClient from '../libs/RippleClient'
// import SessionHandler from '../libs/SessionHandler'
import CryptoApi from '../libs/CryptoApi'
// import config from '../config'

export default function Crypto({ app, socket, log, io, postgres, redis }) {
  // const req = socket.request
  // const session = SessionHandler(req.session, { redis })

  return {
    async getSpotPrice({ type }) {
      const usdPrice = await CryptoApi().usdSpotPrice(type || 'xrp')
      socket.emit(`setSpotPrice`, { [type.toLowerCase()]: usdPrice.data.amount })
    }
  }
}
