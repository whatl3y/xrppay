import Api from './api/index.js'

export default function(options) {
  return {
    priority: 0,
    verb: 'ALL',
    route: '/api/:version/:namespace/*',
    handler: async function ApiRoute(req, res, next) {
      try {
        const version = req.params.version
        const namespace = req.params.namespace
        const path = req.params[0]

        const namespacedRoutes = Api[version][namespace](options)
        return await namespacedRoutes[path](req, res)

      } catch(err) {
        next(err)
      }
    }
  }
}
