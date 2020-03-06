import BigNumber from 'bignumber.js'
import RippleClient from '../../../../libs/RippleClient'
import SessionHandler from '../../../../libs/SessionHandler'
import CryptoWallet from '../../../../libs/models/CryptoWallet'
import config from '../../../../config'

export default function({ io, log, postgres, redis }) {
  return {
    async ['xrp/send'](req, res) {
      try {
        const ripple = RippleClient()
        const wallets = CryptoWallet(postgres)
        const session = SessionHandler(req.session, { redis })
        const user = session.getLoggedInUserId(true)
        const {
          addr,
          tag,
          amount
        } = req.body

        if (!(addr && tag && amount))
          return res.status(400).json({ error: `Make sure you include a destination address, tag, and amount of XRP to send.` })

        const xrpWallet = await wallets.findOrCreateBy({ user_id: user.id, type: 'xrp' })
        const currentAmount = new BigNumber(xrpWallet.current_amount)
        if (!xrpWallet || currentAmount.isLessThanOrEqualTo(1))
          return res.status(400).json({ error: `You need at least 1 XRP in your wallet to send to another address.` })

        if (currentAmount.isLessThan(amount))
          return res.status(400).json({ error: `You are trying to send more XRP than is in your wallet. Please specify an amount up to your wallet amount.` })

        const info = await ripple.sendPayment(
          xrpWallet.mod2,
          xrpWallet.private_key || config.ripple.masterAddrSecret,
          new BigNumber(xrpWallet.mod1).toNumber(),
          addr,
          new BigNumber(tag).toNumber(),
          amount.toFixed(5))

        const txn = info.result.tx_json
        const subtractAmount = new BigNumber(txn.Amount).plus(txn.Fee)

        wallets.setRecord({
          id: xrpWallet.id,
          current_amount: currentAmount.minus(ripple.client.dropsToXrp(subtractAmount))
        })
        await wallets.save()
        io.in(`user_${user.id}`).emit(`setUserWallet`, { xrp: wallets.record })

        res.json(true)

      } catch(err) {
        log.error(`Error sending XRP`, err)
        res.status(500).json({ error: err.message })
      }
    }
  }
}