import BigNumber from 'bignumber.js'
import DatabaseModel from './DatabaseModel'

export default function CryptoWallet(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'crypto_wallet')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'user_id',
        'type',           // xrp, btc, etc...
        'public_addr',
        'private_key',
        'current_amount', // primary currency amount (i.e. XRP for ripple instead of drops)
        'mod1',
        'mod2',
        'mod3'
      ],

      async updateIncremental(userId, type, debitOrCredit, amountAbsValue) {
        amountAbsValue = new BigNumber(amountAbsValue)

        await this.findOrCreateBy({ user_id: userId, type })
        const currentAmount = new BigNumber(this.record.current_amount)
        const netUpdateAmount = (debitOrCredit === 'credit') ? amountAbsValue : amountAbsValue.times(-1)
        this.setRecord({ current_amount: currentAmount.plus(netUpdateAmount).toString() })
        await this.save()
        return this.record
      },

      // This makes an assumption that `debitsAndCredits` contains ALL debits and
      // credits for a given user wallet.
      async resetBalancefromAllDebitsAndCredits(userId, type, debitsAndCredits=[]) {
        await this.findOrCreateBy({ user_id: userId, type })
        let netAmount = new BigNumber(0)
        debitsAndCredits.forEach(info => {
          const { debitOrCredit, amountAbsValue } = info
          const netUpdateAmount = new BigNumber(amountAbsValue).times((debitOrCredit === 'credit') ? 1 : -1)
          netAmount = netAmount.plus(netUpdateAmount)
        })

        this.setRecord({ current_amount: netAmount.toString() })
        await this.save()
        return this.record
      }
    }
  )
}
