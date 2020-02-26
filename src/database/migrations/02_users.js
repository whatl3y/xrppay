export default [
  async function createUsers(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS users (
        id bigserial PRIMARY KEY,
        name varchar(255),
        username_email varchar(255) unique not null,
        password_hash varchar(255),
        first_name varchar(255),
        last_name varchar(255),
        phone_number varchar(255),
        job_title varchar(255),
        avatar_file varchar(255),
        is_verified boolean,
        verification_code varchar(255),
        user_type varchar(255) DEFAULT 'external',
        needs_password_reset boolean,
        last_password_reset timestamptz,
        last_login timestamptz,
        last_session_refresh timestamptz,
        num_logins integer,
        two_factor_enabled boolean,
        two_factor_secret varchar(255),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)

    await postgres.addColumnIfNotExists('users', 'two_factor_last_entered', 'timestamptz')
    await postgres.addColumnIfNotExists('users', 'two_factor_timeout_minutes', 'bigint DEFAULT 10080') // default 7 days (60 * 24 * 7)
  },

  async function createUsersIndexes(postgres) {
    await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS users_username_email_idx on users (username_email)`)
  }
]
