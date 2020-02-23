export default [
  async function createPrivacyCards(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS privacy_cards (
        id bigserial PRIMARY KEY,
        user_id bigint REFERENCES users,
        is_active boolean NOT NULL DEFAULT true,
        friendly_name varchar(255),
        card_token varchar(100),
        card_number varchar(20),
        cvv varchar(10),
        exp_month varchar(10),
        exp_year varchar(10),
        hostname varchar(255),
        type varchar(20),
        state varchar(20),
        spend_limit_duration varchar(20),
        spend_limit integer, -- amount in cents
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)
  },

  async function createPrivacyCardsIndexes(postgres) {
    await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS privacy_cards_user_id_idx on privacy_cards (user_id)`)
  }
]
