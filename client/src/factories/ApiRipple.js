import XrppayFetch from './XrppayFetch'
import { handleFetchResponse } from './ApiHelpers'

export default {
  async sendXrp({ addr, tag, amount }) {
    const response = await XrppayFetch(`/api/1.0/ripple/xrp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addr, tag, amount })
    })
    return await handleFetchResponse(response)
  }
}
