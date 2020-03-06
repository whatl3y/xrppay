import minimist from 'minimist'
import PostgresClient from '../../libs/PostgresClient'
import RippleClient from '../../libs/RippleClient'
import CryptoTransactions from '../../libs/models/CryptoTransactions'
import config from '../../config'

const argv = minimist(process.argv.slice(2))
const howManyLedgersAgo = parseInt(argv.n|| 1e4)
const maxLedger = argv.l

const postgres = new PostgresClient()

;(async function backfillTransactions() {
  try {
    const ripple = RippleClient()
    const latestLedgerToCheck = maxLedger ? parseInt(maxLedger) : await ripple.getLedgerVersion()

    let span = 1e3
    let current = latestLedgerToCheck - howManyLedgersAgo
    while (current < latestLedgerToCheck) {
      const localLatestLedger = current + span
      const transactions = await ripple.getTransactions(config.ripple.masterAddr, {
        minLedgerVersion: current,
        maxLedgerVersion: localLatestLedger
      })

      console.log(`Transactions length between ledger versions ${current}-${localLatestLedger}:`, transactions.length)
      await Promise.all(
        transactions.map(async function populateTxn(txn) {
          // console.log("TXN", txn)
          await CryptoTransactions(postgres).xrpCreateFromTxnObject(txn)
        })
      )

      current += span
    }

    console.log("Successfully backfilled all transactions for address:", config.ripple.masterAddr)

  } catch(err) {
    console.error(`Error backfilling transactions`, err)
  } finally {
    process.exit()
  }
})()
