import config from '../../../../config'

export default function({ io, log, postgres, redis }) {
  return {
    async ['client/reset'](req, res) {
      const userId = req.query.id
      io.in(`user_${userId}`).emit('reset')
      res.json(true)
    }
  }
}