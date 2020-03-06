export default [
  async function createPrivacyCardTransactions(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS privacy_card_transactions (
        id bigserial PRIMARY KEY,
        privacy_card_id bigint REFERENCES privacy_cards,
        transaction_token varchar(100),
        amount_cents integer,
        settled_amount_cents integer,
        status varchar(100),
        result varchar(100),
        transaction_created_at timestamptz,
        merchant_descriptor varchar(255),
        merchant_city varchar(255),
        merchant_state varchar(255),
        merchant_country varchar(255),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(transaction_token)
      );
    `)
  },

  async function createPrivacyCardTransactionsIndexes(postgres) {
    await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS privacy_card_transactions_privacy_card_id_idx on privacy_card_transactions (privacy_card_id)`)
  }
]
