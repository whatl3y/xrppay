import PostgresSqlParser from '../PostgresSqlParser'
import DatabaseModel from './DatabaseModel'

export default function AuditLog(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'audit_log')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'user_id',
        'action',
        'ip_address',
        'additional_info'
      ],

      async log({ user_id, action, ip_address, additional_info }={}) {
        this.resetRecord()
        this.setRecord({ user_id, action, ip_address, additional_info })
        return await this.save()
      },

      async getLogs(userId, page=1, pageSize=30, filters=null) {
        let filterQuery = []
        let filterParams = []
        if (filters) {
          Object.keys(filters).forEach(column => {
            filterParams.push(filters[column])
            filterQuery.push(`${column} = $${filterParams.length + 2}`)
          })
        }
        filterQuery = (filterQuery.length > 0) ? `and ${filterQuery.join(` and `)}` : ''

        const query = `
          select *
          from audit_log
          where
            user_id = $2
            ${filterQuery}
          order by created_at desc`
        const params = [ userId ].concat(filterParams)

        return await PostgresSqlParser().runPaginationQuery(postgres, query, params, page, pageSize)
      }
    }
  )
}
