import BigNumber from 'bignumber.js'
import DatabaseModel from './DatabaseModel'
import CryptoWallet from './CryptoWallet'
import RippleClient from '../RippleClient'
import config from '../../config'

export default function CryptoTransactions(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'crypto_transactions')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'txn_hash',
        'type',
        'is_final',
        'source_account_hash',
        'source_user_id',
        'destination_account_hash',
        'destination_user_id',
        'txn_amount',
        'txn_amount_type',
        'fee_amount',
        'fee_amount_type',
        'raw'
      ],

      async xrpGetTransactionsForUser(userId) {
        const addresses = [config.ripple.masterAddr, config.ripple.masterClassicAddr]

        const [ credits, debits ] = await Promise.all([
          postgres.query(`
            select * from crypto_transactions
            where
              type = 'xrp' and
              destination_account_hash = ANY($1) and
              destination_user_id = $2
          `, [ addresses, userId ]),

          postgres.query(`
            select * from crypto_transactions
            where
              type = 'xrp' and
              source_account_hash = ANY($1) and
              source_user_id = $2
          `, [ addresses, userId ]),
        ])
        
        return {
          credits: credits.rows,
          debits: debits.rows
        }
      },

      async xrpCreateFromTxnObject(txn) {
        const ripple = RippleClient()
        const trans = CryptoTransactions(postgres)
        await trans.findOrCreateBy({ txn_hash: txn.id })
        trans.setRecord({
          type: 'xrp',
          is_final: txn.outcome.result === 'tesSUCCESS',
          source_account_hash: txn.specification.source.address,
          source_user_id: txn.specification.source.tag,
          destination_account_hash: txn.specification.destination.address,
          destination_user_id: txn.specification.destination.tag,
          txn_amount: txn.outcome.deliveredAmount.currency.toLowerCase() === 'xrp' ? ripple.client.xrpToDrops(txn.outcome.deliveredAmount.value) : null,
          txn_amount_type: 'drops',
          fee_amount: ripple.client.xrpToDrops(txn.outcome.fee),
          fee_amount_type: 'drops',
          raw: txn
        })
        await trans.save()
        return trans.record
      },

      async xrpCreateFromEventStream(evt) {
        const trans = CryptoTransactions(postgres)
        await trans.findOrCreateBy({ txn_hash: evt.transaction.hash })
        trans.setRecord({
          type: 'xrp',
          is_final: evt.validated,
          source_account_hash: evt.transaction.Account,
          source_user_id: evt.transaction.SourceTag,
          destination_account_hash: evt.transaction.Destination,
          destination_user_id: evt.transaction.DestinationTag,
          txn_amount: evt.transaction.Amount,
          txn_amount_type: 'drops',
          fee_amount: evt.transaction.Fee,
          fee_amount_type: 'drops',
          raw: evt.transaction
        })
        await trans.save()
        return trans.record
      },

      async xrpRefreshUserWallet(userId) {
        const ripple = RippleClient()
        const { credits, debits } = await this.xrpGetTransactionsForUser(userId)
        const updatedWallet = await CryptoWallet(postgres).resetBalancefromAllDebitsAndCredits(userId, 'xrp', [
          ...credits.map(txn => {
            return {
              debitOrCredit: 'credit',
              amountAbsValue: ripple.client.dropsToXrp(txn.txn_amount)
            }
          }),
          ...debits.map(txn => {
            const changeAmountDrops = new BigNumber(txn.txn_amount || 0).plus(txn.fee_amount || 0)
            return {
              debitOrCredit: 'debit',
              amountAbsValue: ripple.client.dropsToXrp(changeAmountDrops.toString())
            }
          })
        ])
        return updatedWallet
      }
    }
  )
}
