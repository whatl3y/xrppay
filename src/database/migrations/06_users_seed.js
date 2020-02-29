const seedEmailAddress = process.env.SEED_EMAIL_ADDRESS || 'whatl3y@gmail.com'

export default async function seedUsers(postgres) {
  const { rows } = await postgres.query(`select * from users where username_email = '${seedEmailAddress}'`)
  if (rows.length === 0) {
    await postgres.query(`
      INSERT INTO users (username_email, user_type, is_verified)
      VALUES
      ('${seedEmailAddress}', 'superuser', true) returning id
    `)
  }

  const info = await postgres.query(`select max(id) as id from users`)
  if (info.rows.length === 0 || info.rows[0].id < 1e5)
    await postgres.query(`select setval('users_id_seq', 11111)`)
}
