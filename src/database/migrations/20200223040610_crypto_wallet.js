export default [
  async function createCryptoWallet(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS crypto_wallet (
        id bigserial PRIMARY KEY,
        user_id bigint REFERENCES users,
        type varchar(255),
        public_addr varchar(255),
        private_key varchar(255),
        current_amount varchar(255) NOT NULL DEFAULT '0',
        mod1 varchar(255),
        mod2 varchar(255),
        mod3 varchar(255),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(user_id, type)
      );
    `)
  },

  async function createCryptoWalletIndexes(postgres) {
    await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS crypto_wallet_user_id_idx on crypto_wallet (user_id)`)
  }
]
