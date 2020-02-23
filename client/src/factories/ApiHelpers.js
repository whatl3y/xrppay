export async function handleFetchResponse(response, type='json') {
  const typeParser = (type) ? await response[type]() : null
  if (response.status >= 400) {
    let errorInfo = null
    try {
      if (!typeParser) {
        errorInfo = (await response.json()).error
      } else {
        errorInfo = typeParser.error
      }
    } finally {
      errorInfo = errorInfo || response
    }

    throw new Error(errorInfo)

  } else {
    return typeParser
  }
}

export function serialize(obj) {
  let a = []
  for (const _key in obj) {
    if (obj[_key] instanceof Array) {
      for (let _i = 0; _i < obj[_key].length; _i++) {
        a.push(encodeURIComponent(_key) + '=' + encodeURIComponent(obj[_key][_i]))
      }
    } else {
      a.push(encodeURIComponent(_key) + '=' + encodeURIComponent(obj[_key]))
    }
  }
  return a.join("&")
}

export function unserialize(string) {
  string = (/^\?/.test(string)) ? string.substring(1) : string
  const a = string.split("&")
  let obj = {}
  for (let _i = 0; _i < a.length; _i++) {
    var _a = a[_i].split("=")
    obj[ decodeURIComponent(_a[0]) ] = decodeURIComponent(_a[1])
  }
  return obj
}
