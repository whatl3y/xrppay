import BigNumber from 'bignumber.js'
import CryptoApi from '../../../../libs/CryptoApi'
import PrivacyAPI from '../../../../libs/PrivacyAPI'
import RippleClient from '../../../../libs/RippleClient'
import SessionHandler from '../../../../libs/SessionHandler'
import CryptoWallet from '../../../../libs/models/CryptoWallet'
import PrivacyCards from '../../../../libs/models/PrivacyCards'
import config from '../../../../config'

export default function({ io, log, postgres, redis }) {
  return {
    async ['xrp/send'](req, res) {
      try {
        const ripple  = RippleClient()
        const wallets = CryptoWallet(postgres)
        const cards   = PrivacyCards(postgres)
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
        const amountToSend = new BigNumber(amount)
        const currentAmount = new BigNumber(xrpWallet.current_amount)
        if (!xrpWallet || currentAmount.isLessThanOrEqualTo(1))
          return res.status(400).json({ error: `You need at least 1 XRP in your wallet to send to another address.` })

        if (currentAmount.isLessThan(amountToSend))
          return res.status(400).json({ error: `You are trying to send more XRP than is in your wallet. Please specify an amount up to your wallet amount.` })

        // pause privacy card if it's open so it's no longer usable and
        // needs to be relocked to use at a merchant
        const cardRecord = await cards.findBy({ user_id: user.id, is_active: true })
        if (cardRecord) {
          const [ card ] = await PrivacyAPI(config.privacy.apiKey).listCards({ card_token: cardRecord.card_token })
          if (card.state === 'OPEN') {
            const updatedCard = await cards.updateCard(user.id, { limit: 0, state: 'PAUSED' })
            io.in(`user_${user.id}`).emit(`getPrivacyActiveCard`, updatedCard)
          }
        }

        const info = await ripple.sendPayment(
          xrpWallet.mod2,
          xrpWallet.private_key || config.ripple.masterAddrSecret,
          new BigNumber(xrpWallet.mod1).toNumber(),
          addr,
          new BigNumber(tag).toNumber(),
          amountToSend.toFixed(5))

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
    },

    async ['cold/wallet'](req, res) {
      const api     = CryptoApi()
      const ripple  = RippleClient()
      const session = SessionHandler(req.session)
      const user = session.getLoggedInUserId(true)

      if (user.username_email !== 'whatl3y@gmail.com')
        return res.status(401).json({ error: `You must be an admin to get here.` })

      if (!config.ripple.coldWalletAddr)
        return res.status(400).json({ error: `No cold wallet available to check.` })

      const response = await ripple.getBalances(config.ripple.coldWalletAddr)
      const resWithUsd = await Promise.all(
        response.map(async balance => {
          try {
            const usdExchangeRate = await api.usdSpotPrice(balance.currency)
            return {
              ...balance,
              usdEstimate: new BigNumber(balance.value).times(usdExchangeRate.data.amount).toString()
            }
          } catch(err) {
            return balance
          }
        })
      )

      res.json(resWithUsd)
    }
  }
}