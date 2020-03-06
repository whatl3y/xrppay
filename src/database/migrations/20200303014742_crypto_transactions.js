export default [
  async function createCryptoTransactions(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS crypto_transactions (
        id bigserial PRIMARY KEY,
        txn_hash varchar(255),
        type varchar(255), -- xrp, btc, manual, etc..
        is_final boolean,
        source_account_hash varchar(255),
        source_user_id bigint,
        destination_account_hash varchar(255),
        destination_user_id bigint,
        txn_amount varchar(100),
        txn_amount_type varchar(255),
        fee_amount varchar(100),
        fee_amount_type varchar(255),
        raw jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(txn_hash)
      );
    `)
  }
]
