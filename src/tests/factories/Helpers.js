export function insertQuery(table, keyValuePairs) {
  const keys    = Object.keys(keyValuePairs)
  const values  = Object.values(keyValuePairs)

  return `
    insert into ${table} (${keys.join(',')})
    values
    (${values.map(v => (typeof v === 'string') ? `'${v}'` : (v || 'NULL')).join(',')})
    returning id`
}

export async function createRecord(postgres, table, keyValuePairs) {
  const { rows } = await postgres.query(insertQuery(table, keyValuePairs))
  return rows[0].id
}

export async function truncateTable(postgres, ...tables) {
  await postgres.query(`truncate ${tables.join(',')} cascade`)
}
