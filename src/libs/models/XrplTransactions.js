import DatabaseModel from './DatabaseModel'
import RippleClient from '../RippleClient'
import config from '../../config'

export default function XrplTransactions(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'xrpl_transactions')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'transaction_hash',
        'engine_result',
        'engine_result_code',
        'ledger_hash',
        'ledger_version',
        'is_validated',
        'source_account_hash',
        'source_tag',
        'destination_account_hash',
        'destination_tag',
        'amount_drops',
        'fee_drops',
        'last_ledger_sequence'
      ],

      async getTransactionsForUser(userId) {
        const addresses = [config.ripple.masterAddr, config.ripple.masterClassicAddr]

        const [ credits, debits ] = await Promise.all([
          postgres.query(`
            select * from xrpl_transactions
            where
              destination_account_hash = ANY($1) and
              destination_tag = $2
          `, [ addresses, userId ]),

          postgres.query(`
            select * from xrpl_transactions
            where
              source_account_hash = ANY($1) and
              source_tag = $2
          `, [ addresses, userId ]),
        ])
        
        return {
          credits: credits.rows,
          debits: debits.rows
        }
      },

      async createFromTxnObject(txn) {
        const ripple = RippleClient()
        const trans = XrplTransactions(postgres)
        await trans.findOrCreateBy({ transaction_hash: txn.id })
        trans.setRecord({
          engine_result: txn.outcome.result,
          // engine_result_code: evt.engine_result_code,
          // ledger_hash: evt.ledger_hash,
          ledger_version: txn.outcome.ledgerVersion,
          // is_validated: evt.validated,
          source_account_hash: txn.specification.source.address,
          source_tag: txn.specification.source.tag,
          destination_account_hash: txn.specification.destination.address,
          destination_tag: txn.specification.destination.tag,
          amount_drops: txn.outcome.deliveredAmount.currency.toLowerCase() === 'xrp' ? ripple.client.xrpToDrops(txn.outcome.deliveredAmount.value) : null,
          fee_drops: ripple.client.xrpToDrops(txn.outcome.fee),
          // last_ledger_sequence: evt.transaction.LastLedgerSequence
        })
        await trans.save()
        return trans.record
      },

      async createFromEventStream(evt) {
        const trans = XrplTransactions(postgres)
        await trans.findOrCreateBy({ transaction_hash: evt.transaction.hash })
        trans.setRecord({
          engine_result: evt.engine_result,
          engine_result_code: evt.engine_result_code,
          ledger_hash: evt.ledger_hash,
          ledger_version: evt.ledger_index,
          is_validated: evt.validated,
          source_account_hash: evt.transaction.Account,
          source_tag: evt.transaction.SourceTag,
          destination_account_hash: evt.transaction.Destination,
          destination_tag: evt.transaction.DestinationTag,
          amount_drops: evt.transaction.Amount,
          fee_drops: evt.transaction.Fee,
          last_ledger_sequence: evt.transaction.LastLedgerSequence
        })
        await trans.save()
        return trans.record
      }
    }
  )
}
