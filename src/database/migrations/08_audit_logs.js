export default [
  async function createAuditLog(postgres) {
    await postgres.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id bigserial PRIMARY KEY,
        user_id bigint REFERENCES users,
        ip_address varchar(255),
        action varchar(255),
        additional_info text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)
  },

  async function createAuditLogIndexes(postgres) {
    await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS audit_log_user_id_idx on audit_log (user_id)`)
  }
]
