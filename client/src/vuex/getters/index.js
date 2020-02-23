export default {
  routeNamespace(state) {
    return state.router.currentRoute.fullPath.split('/')[1]
  }
}
