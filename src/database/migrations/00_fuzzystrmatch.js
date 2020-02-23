export default async function createFuzzystrmatchExtension(postgres) {
  await postgres.query(`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`)
}
