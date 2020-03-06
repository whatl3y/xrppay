import crypto from 'crypto'
import qs from 'querystring'
import request from 'request-promise-native'

export default function PrivacyAPI(apiKey, serverUrl='https://sandbox.privacy.com/v1/') {
  const client = request.defaults({
    baseUrl: serverUrl,
    headers: {
      'Authorization': `api-key ${apiKey}`,
      'Accept': 'application/json'
    }
  })

  return {
    client,

    // https://developer.privacy.com/docs#endpoints-list-cards
    async listCards(params=null) {
      return await this._getAllPages('/card', params)
    },

    // https://developer.privacy.com/docs#endpoints-list-transactions
    async listTransactions(approvalStatus='all', params=null) {
      return await this._getAllPages(`transaction/${approvalStatus}`, params)
    },

    // https://developer.privacy.com/docs#endpoints-create-card
    async createCard(params={ type: 'UNLOCKED' }) {
      return await this.client.post({
        url: '/card',
        body: params,
        json: true
      })
    },

    // https://developer.privacy.com/docs#endpoints-update-card
    async updateCard(params={ card_token: null }) {
      return await this.client.put({
        url: '/card',
        body: params,
        json: true
      })
    },

    async _getAllPages(endpoint, params=null, currentPage=1, perPage=50, aggData=[]) {
      const fullEndpoint = `${endpoint}?${qs.stringify({ ...params, page: currentPage, page_size: perPage })}`
      const info = await this.client.get(fullEndpoint)
      const {
        data,
        page,
        // total_entries,
        total_pages
      } = JSON.parse(info)

      const dataAdded = aggData.concat(data)
      if (page < total_pages)
        return await this._getAllPages(endpoint, params, page + 1, perPage, dataAdded)

      return dataAdded
    },

    async simulateAuthorization(cardNum, merchant, amountUsdCents) {
      return await this.client.post({
        url: '/simulate/authorize',
        body: {
          descriptor: merchant,
          pan: cardNum,
          amount: amountUsdCents
        },
        json: true
      })
    },

    generateHmac(txnObj, key=apiKey) {
      const hmac = crypto.createHmac('sha256', key)
      const base64Txn = Buffer.from(txnObj).toString('base64')
      hmac.update(base64Txn, 'utf8')
      return hmac.digest('base64')
    }
  }
}