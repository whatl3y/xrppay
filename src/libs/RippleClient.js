import { RippleAPI } from 'ripple-lib'
import { sleep } from './Helpers'
import config from '../config'

// https://xrpl.org/rippleapi-reference.html
export default function RippleClient(serverUrl=config.ripple.rippledUrl, options=null) {
  const client = new RippleAPI({
    ...options,
    server: serverUrl
  })

  return {
    client,

    async connect() {
      if (this.client.isConnected())
        return

      return await this.client.connect()
    },

    async disconnect() {
      return await this.client.disconnect()
    },

    async getServerInfo() {
      await this.connect()
      return await this.client.getServerInfo()
    },

    async getBalances(addr, options={}) {
      await this.connect()
      return await this.client.getBalances(addr, options)
    },

    async getTransaction(txnHash, options={}) {
      await this.connect()
      return await this.client.getTransaction(txnHash, options)
    },

    // https://xrpl.org/rippleapi-reference.html#gettransactions
    async getTransactions(addr, options={}) {
      await this.connect()
      return await this.client.getTransactions(addr, options)
    },

    // https://xrpl.org/rippleapi-reference.html#getledger
    async getLedger(version) {
      await this.connect()
      return await this.client.getLedger({ ledgerVersion: version })
    },

    async sendPayment(
      sourceAddr,
      sourceAddrSecret,
      targetAddr,
      targetTag,
      amountXrp
    ) {
      return await this.executeTransaction('Payment', sourceAddr, sourceAddrSecret, {
        "Amount": this.client.xrpToDrops(amountXrp.toString()),
        "Destination": targetAddr,
        "DestinationTag": targetTag
      })
    },

    async executeTransaction(
      type,
      sourceAddr,
      sourceAddrSecret,
      prepareOptions={}
    ) {
      await this.connect()
      const [ feeXrp, currLedger ] = await Promise.all([
        this.client.getFee(),
        this.client.getLedgerVersion()
      ])

      const preparedTx = await this.client.prepareTransaction({
        "TransactionType": type,
        "Fee": this.client.xrpToDrops(feeXrp),
        "Account": sourceAddr,
        "LastLedgerSequence": currLedger + 4,
        ...prepareOptions
      })

      const response = this.client.sign(preparedTx.txJSON, sourceAddrSecret)
      const txID = response.id
      const txBlob = response.signedTransaction
      const result = await this.client.submit(txBlob)

      // console.log("Tentative result code:", result.resultCode)
      // console.log("Tentative result message:", result.resultMessage)

      return { txID, result, currLedger }
    },

    async checkTxIsValidated(
      txID,
      earliestLedgerVersion,
      currentAttempt=1,
      maxTries=20
    ) {
      await this.connect()
      try {
        // `earliestLedgerVersion` should be one more than the `currLedger`
        // returned from this.sendCurrency
        const tx = await this.client.getTransaction(txID, { minLedgerVersion: earliestLedgerVersion })
        // console.log("Transaction result:", tx.outcome.result)
        // console.log("Balance changes:", JSON.stringify(tx.outcome.balanceChanges))
        return tx
      } catch(err) {
        if (currentAttempt > maxTries)
          throw err

        await sleep(2000)
        return await this.checkTxIsValidated(txID, earliestLedgerVersion, currentAttempt + 1, maxTries)
      }
    },

    // https://xrpl.org/rippleapi-reference.html#listening-to-streams
    // https://xrpl.org/subscribe.html
    async subscribeToAddress(addr, txnCallback) {
      await this.client.connect()
      this.client.connection.on('transaction', txnCallback)
      const res = await this.client.request('subscribe', { accounts: [ addr ] })
      return res
    },

    // https://xrpl.org/unsubscribe.html
    async unsubscribeFromAddress(addr) {
      await this.client.connect()
      const res = await this.client.request('unsubscribe', {
        accounts: [ addr ],
        streams: [ 'transactions' ]
      })
      return res
    },

    generateAddress(options={}) {
      return this.client.generateXAddress({
        ...options,
        includeClassicAddress: true,
        test: !config.server.isProduction
      })
    }
  }
}