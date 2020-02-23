export default [
  async function addBioColsToUsers(postgres) {
    await postgres.addColumnIfNotExists('users', 'summary', 'text')
    await postgres.addColumnIfNotExists('users', 'experience', 'jsonb')
    await postgres.addColumnIfNotExists('users', 'education', 'jsonb')
  }
]
