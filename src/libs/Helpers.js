export function flatten(ary) {
  const nestedFlattened = ary.map(v => {
    if (v instanceof Array)
      return flatten(v)
    return v
  })
  return [].concat.apply([], nestedFlattened)
}

export function arrayGroupBy(ary, mapper) {
  return ary.reduce((agg, item) => {
    const aggKey = mapper(item).toString()
    agg[aggKey] = (agg[aggKey] || []).concat([item])
    return agg
  }, {})
}

export function camelCaseToUnderscore(str) {
  return str.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase()
}

export function createNestedArrays(ary, length=10) {
  const aryCopy   = ary.slice(0)
  let nestedArys  = []

  while (aryCopy.length > 0) {
    nestedArys.push(aryCopy.splice(0, length))
  }
  return nestedArys
}

export async function sleep(timeoutMs=1000) {
  return await new Promise(resolve => setTimeout(resolve, timeoutMs))
}

export function paginateArray(ary, perPage=9e7, pageNumber=1) {
  const start = perPage * (pageNumber-1)

  if (ary instanceof Array) {
    const size = ary.length
    return {
      data: ary.slice(start,start+perPage),
      numberOfPages: Math.ceil(size/perPage),
      currentPage: pageNumber,
      dataLength: size
    }
  } else if (typeof ary === "object" && ary != null) {
    const obj = ary
    const keys = Object.keys(obj).sort()
    const size = keys.length
    const filteredKeys = keys.slice(start,start+perPage)
    let filteredObj = {}
    for (var _i=0; _i<filteredKeys.length; _i++) {
      filteredObj[filteredKeys[_i]] = obj[filteredKeys[_i]]
    }

    return {
      data: filteredObj,
      numberOfPages: Math.ceil(size/perPage),
      currentPage: pageNumber,
      dataLength: size
    }
  }

  return ary
}

// Extended from polyfill here:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
export function objectDeepAssign(target, varArgs) { // .length of function is 2
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var to = Object(target)

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index]

    if (nextSource != null) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          // This is the "deep assign" part, which recursively dives into
          // the objects to ensure nested keys are preserved
          if (to[nextKey] && to[nextKey].toString() === '[object Object]' && nextSource[nextKey] && nextSource[nextKey].toString() === '[object Object]') {
            to[nextKey] = objectDeepAssign({}, to[nextKey], nextSource[nextKey])
          } else {
            to[nextKey] = nextSource[nextKey]
          }
        }
      }
    }
  }
  return to
}

export function titleCase(string, removeUnderscores=false) {
  if (!string)
    return ''

  if (removeUnderscores)
    string = string.replace(/_/g, ' ')
  return string.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

export async function getCacheToDatabaseFallback({ redis, postgres }, cacheKey, query, values=[]) {
  const cachedResults = await redis.get(cacheKey)
  if (cachedResults)
    return JSON.parse(cachedResults)

  const { rows } = await postgres.query(query, values)
  if (rows && rows.length > 0)
    await redis.set(cacheKey, JSON.stringify(rows))

  return rows
}
