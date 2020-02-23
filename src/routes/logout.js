import Users from '../libs/models/Users'

export default function() {
  return {
    priority: 0,
    verb: 'GET',
    route: '/logout',
    handler: async function Logout(req, res) {
      await Users(null, req.session).logout()
      req.logout()
      res.redirect("/login")
    }
  }
}