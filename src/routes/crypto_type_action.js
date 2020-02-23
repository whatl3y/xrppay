import path from 'path'
import config from '../config'

export default function({ log, postgres, redis }) {
  return {
    priority: 1,
    verb: 'ALL',
    route: '/crypto/:type/:action',
    handler: async function CryptoTypeAction(req, res) {
      const type = req.params.type
      const action = req.params.action

      res.json({  })
    }
  }
}