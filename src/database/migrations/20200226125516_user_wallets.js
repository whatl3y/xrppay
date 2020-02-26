export default [
  async function createUserWallets(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS user_wallets (
        id bigserial PRIMARY KEY,
        user_id bigint REFERENCES users,
        type varchar(255),
        current_amount float NOT NULL DEFAULT 0::float,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)
  },

  async function createUserWalletsIndexes(postgres) {
    await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS user_wallets_user_id_idx on user_wallets (user_id)`)
  }
]
