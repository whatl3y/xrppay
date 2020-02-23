export default class AccountDisabled extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, AccountDisabled)

    this.redirectRoute = '/autherror/disabled'
  }
}
