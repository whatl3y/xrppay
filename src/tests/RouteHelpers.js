export function getRequest(objectToAppend={}) {
  return Object.assign({
    get: () => '',
    method: 'GET',
    cookies: {},
    headers: {},
    query: {},
    useragent: {},
    session: {
      current_team: { id: 1 },
      destroy: cb => cb(),
      save: cb => cb()
    }
  }, objectToAppend)
}

export function getResponse(objectToMutate, resolve) {
  return {
    header: () => null,
    json: obj => resolve(Object.assign(objectToMutate, { resolved: obj })),
    sendStatus: status => resolve(Object.assign(objectToMutate, { status })),
    status: function(status) { objectToMutate.status = status; return this }
  }
}
