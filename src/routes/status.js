export default function() {
  return {
    priority: 0,
    verb: 'GET',
    route: '/status',
    handler: function Status(req, res) {
      res.sendStatus(204)
    }
  }
}