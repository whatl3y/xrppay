import { insertQuery, truncateTable } from './Helpers'

export async function createUser(postgres, additionalFields={}) {
  return await postgres.query(insertQuery('users', Object.assign({ name: 'Lance', username_email: 'lance.whatley@risk3sixty.com' }, additionalFields)))
}

export async function truncateUsers(postgres) {
  await truncateTable(postgres, 'users')
}
