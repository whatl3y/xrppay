export default async function createUuidExtension(postgres) {
  await postgres.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
}
