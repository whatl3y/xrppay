import { addToRoom, getUsers } from './index'
import SessionHandler from '../libs/SessionHandler'

export default function Global({ app, socket, log, io, postgres, redis }) {
  const req = socket.request
  const session = SessionHandler(req.session, { redis })

  return {
    async globalSubscribe(pagePath) {
      const userRecord = session.getLoggedInUserId(true)
      const loggedIn = !!userRecord
      socket.emit('isLoggedIn', userRecord)

      await app.set('socketPage', socket.id, { date: new Date(), page: pagePath })

      if (loggedIn) {
        await addToRoom(app, socket, `page_${pagePath}`)
        await addToRoom(app, socket, `user_${userRecord.id}`)
      }
    },

    async globalUpdatePagePath(pagePath) {
      const userRecord = session.getLoggedInUserId(true)
      const loggedIn = !!userRecord
      await app.set('socketPage', socket.id, { date: new Date(), page: pagePath })

      if (loggedIn) {
        await addToRoom(app, socket, `page_${pagePath}`)
      }
    }
  }
}
