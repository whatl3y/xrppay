import request from 'request-promise-native'
import App from "./App"
import Global from "./Global"
import Privacy from "./Privacy"
import Ripple from "./Ripple"
import SessionHandler from '../libs/SessionHandler'
import { flatten } from '../libs/Helpers'
import config from '../config'

export default async function WebSocket({ io, log, postgres, redis }) {
  const app = App(redis)
  let firstConnection = true

  io.on('connection', async function socketConnect(socket) {
    if (firstConnection) {
      // Since it's our first connection, let's flush the data for our
      // app here and let it rebuild as people connect.
      await app.flush()
      firstConnection = false
    }

    // await app.globalLock()

    const req     = socket.request
    const session = SessionHandler(req.session, { redis })
    const user    = session.getLoggedInUserId(true)

    const factoryArgs = { app, socket, log, io, postgres, redis }
    const handlers = {
      global: Global(factoryArgs),
      privacy: Privacy(factoryArgs),
      ripple: Ripple(factoryArgs)
    }

    Object.keys(handlers).forEach(category => {
      Object.keys(handlers[category]).forEach(evt => {
        socket.on(evt, async function(...args) {
          try {
            await handlers[category][evt](...args)
          } catch(err) {
            log.error(`Error with socket handler: ${category} - ${evt}`, err)
          }
        })
      })
    })
    socket.on('disconnect', async () => await disconnectSocket(app, io, socket))

    if (user && user.id) {
      const realClientIpAddress = session.getClientIp(req, socket)

      let [ , userInfo ] = await Promise.all([
        app.set('sockets', socket.id, user.id),
        app.get('users', user.id)
      ])

      await app.set('users', user.id, (userInfo || []).concat([{
        id: socket.id,
        date: new Date(),
        ipAddress: realClientIpAddress,
        userName: user.name,
        userEmail: user.username_email
      }]))
    }

    // await app.globalLock(true)
  })
}

export function getSocketById(io, socketId, namespace='/') {
  return io.nsps[namespace].sockets[socketId]
}

export async function getUsers(app, socketId=null) {
  let usersAndSockets = []
  if (socketId) {
    const userId = await app.get('sockets', socketId)
    if (userId) {
      usersAndSockets = await app.get('users', userId)
      usersAndSockets = usersAndSockets.filter(i => i.id === socketId).reduce((obj, info) => ({ ...obj, [userId]: [ info ] }), {})
    }
  } else {
    usersAndSockets = await app.get('users')
  }

  const socketPages = await app.get('socketPage')
  const users = Object.keys(usersAndSockets).map(userId => {
    const allSockets = usersAndSockets[userId]
    return allSockets.map(info => {
      const pageInfo = socketPages[info.id] || {}
      return {
        ...info,
        page: pageInfo.page,
        pageDate: pageInfo.date
      }
    })
  })

  return await Promise.all(
    flatten(users).map(async user => {
      try {
        return {
          ...user,
          location: await request.get(`${config.server.geoHost}/${user.ipAddress}`, { json: true })
        }
      } catch(err) {
        return user
      }
    })
  )
}

export async function addToRoom(app, socket, room) {
  const socketId = socket.id
  socket.join(room)

  const socketRooms = await app.get('rooms', room)
  await app.set('rooms', room, (socketRooms || []).concat([socketId]))

  const userId = await app.get('sockets', socketId)
  if (userId) {
    const userRooms = await app.get('userRooms', userId)
    await app.set('userRooms', userId, (userRooms || []).concat([room]))
  }

  return room
}

export async function disconnectSocket(app, io, socket, retries=0) {
  // await app.globalLock()
  const userId = await app.get('sockets', socket.id)

  await Promise.all([
    app.del('sockets', socket.id),
    app.del('socketPage', socket.id)
  ])

  io.in(`page_/admin/users`).emit('adminUserRemoved', socket.id)

  if (userId) {
    const socketsByUserId = await app.get('users', userId)
    await app.set('users', userId, (socketsByUserId || []).map(obj => (obj.id === socket.id) ? null : obj).filter(obj => !!obj))

    const userRooms = await app.get('userRooms', userId)
    if (userRooms) {
      await Promise.all(
        userRooms.map(async room => {
          let roomUsers = (await app.get('rooms', room)) || []
          roomUsers.splice(roomUsers.indexOf(socket.id), 1)
          await app.set('rooms', room, roomUsers)
        })
      )
      await app.del('userRooms', userId)
    }
  }

  // await app.globalLock(true)
}
