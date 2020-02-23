export default {
  rooms: {
    // Contains key/value pairs of [room]: [ socketId1, socketId2, ... ]
  },

  sockets: {
    // Contains key/value pairs of [socket_id]: userId
  },

  users: {
    // Contains key/value pairs of [user_id]: [userInformationObject1, userInformationObject2, ...]
    // { userId1: [{id: socketId1, ...}, {id: socketId2, ...}], userId2: [...] }
  },

  socketPage: {
    // key/value pairs of [socketId]: 'pageUserIsOn'
  },

  userRooms: {
    // key/value pairs of [user_id]: [room1, room2, ...]
    // of rooms that the user is in
  }
}
