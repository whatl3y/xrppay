export default class NoEmailAddress extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, NoEmailAddress)

    this.redirectRoute = '/autherror/noemail'
  }
}
