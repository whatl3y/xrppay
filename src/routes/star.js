import path from 'path'
import config from '../config'

export default function({ log }) {
  return {
    priority: 999,
    verb: 'GET',
    route: '*',
    handler: async function Index(req, res) {
      try {
        res.sendFile(path.join(config.app.rootDir, 'views', 'index.html'))
    
      } catch (err) {
        log.error("Error on homepage", err)
        throw err
      }
    }
  }
}