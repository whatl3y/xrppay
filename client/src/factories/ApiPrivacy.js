import XrppayFetch from './XrppayFetch'
import { handleFetchResponse } from './ApiHelpers'

export default {
  async lockBurnerCard() {
    const response = await XrppayFetch(`/api/1.0/privacy/card/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    return await handleFetchResponse(response)
  },

  async getTransactionHistory(page=1, perPage=20) {
    const response = await XrppayFetch(`/api/1.0/privacy/transaction/history?page=${page || ''}&perPage=${perPage || ''}`)
    return await handleFetchResponse(response)
  }
}
