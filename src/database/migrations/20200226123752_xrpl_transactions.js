export default [
  async function createXrplTransactions(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS xrpl_transactions (
        id bigserial PRIMARY KEY,
        transaction_hash varchar(255),
        engine_result varchar(255),
        engine_result_code integer,
        ledger_hash varchar(255),
        ledger_version bigint,
        is_validated boolean,
        source_account_hash varchar(255),
        source_tag bigint,
        destination_account_hash varchar(255),
        destination_tag bigint,
        amount_drops varchar(100),
        fee_drops varchar(100),
        last_ledger_sequence bigint,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(transaction_hash)
      );
    `)
  }
]
