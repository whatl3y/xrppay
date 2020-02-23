export default class OrganizationDeactivated extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, OrganizationDeactivated)

    this.redirectRoute = '/autherror/orgdeactivated'
  }
}
