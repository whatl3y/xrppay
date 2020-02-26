import DatabaseModel from './DatabaseModel'

export default function UserWallets(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'user_wallets')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'user_id',
        'type',           // xrp, btc, etc...
        'current_amount'  // primary currency amount (i.e. XRP for ripple instead of drops)
      ],

      async updateIncremental(userId, type, debitOrCredit, amountAbsValue) {
        amountAbsValue = parseFloat(amountAbsValue)

        await this.findOrCreateBy({ user_id: userId, type })
        const netUpdateAmount = (debitOrCredit === 'credit') ? amountAbsValue : -amountAbsValue
        this.setRecord({ current_amount: this.record.current_amount + netUpdateAmount })
        await this.save()
        return this.record
      },

      // This makes an assumption that `debitsAndCredits` contains ALL debits and
      // credits for a given user wallet.
      async resetBalancefromAllDebitsAndCredits(userId, type, debitsAndCredits=[]) {
        await this.findOrCreateBy({ user_id: userId, type })
        let netAmount = 0
        debitsAndCredits.forEach(info => {
          const { debitOrCredit, amountAbsValue } = info
          const netUpdateAmount = (debitOrCredit === 'credit') ? parseFloat(amountAbsValue) : -parseFloat(amountAbsValue)
          netAmount += Math.floor(netUpdateAmount * 1e3) / 1e3
        })

        this.setRecord({ current_amount: netAmount })
        await this.save()
        return this.record
      }
    }
  )
}
