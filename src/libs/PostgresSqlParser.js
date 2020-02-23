// import PgQueryParser from 'pg-query-parser'
const PgQueryParser = require('pg-query-parser')

export default function PostgresSqlParser(query=null) {
  return {
    query: query,
    parsedObj: null,

    setQuery(newQuery) {
      this.query = newQuery
      this.parse()
      return this
    },

    parse(newQuery=this.query) {
      this.query = newQuery
      this.parsedObj = PgQueryParser.parse(this.query).query
      return this
    },

    deparse() {
      this.query = PgQueryParser.deparse(this.parsedObj)
      return this
    },

    // NOTE: assumes a select statement for the query type
    setLimit(num) {
      if (!this.parsedObj) {
        this.parse()
      }

      (this.parsedObj[0].SelectStmt.limitCount)
        ? this.parsedObj[0].SelectStmt.limitCount.A_Const.val.Integer.ival = num
        : (this.parsedObj[0].SelectStmt.limitCount = {
          A_Const: {
            val: {
              Integer: {
                ival: num
              }
            }
          }
        })

      return this
    },

    // NOTE: assumes a select statement for the query type
    setOffset(num) {
      if (!this.parsedObj) {
        this.parse()
      }

      (this.parsedObj[0].SelectStmt.limitOffset)
        ? this.parsedObj[0].SelectStmt.limitOffset.A_Const.val.Integer.ival = num
        : (this.parsedObj[0].SelectStmt.limitOffset = {
          A_Const: {
            val: {
              Integer: {
                ival: num
              }
            }
          }
        })

      return this
    },

    setPagination(pageNumber, perPage=100) {
      const limit = perPage
      const offset = (pageNumber - 1) * perPage
      this.setLimit(limit)
      this.setOffset(offset)
      this.addFullCountColumn()

      return this
    },

    async runPaginationQuery(postgres, query, params, page, pageSize) {
      this.setQuery(query).setPagination(page, pageSize).deparse()
      const { rows } = await postgres.query(this.query, params)
      const size = parseInt((rows.length > 0) ? rows[0].full_count : 0)

      return {
        data:         rows,
        numberPages:  Math.ceil(size/pageSize),
        currentPage:  parseInt(page),
        perPage:      parseInt(pageSize),
        totalCount:   size
      }
    },

    // NOTE: assumes a select statement for the query type
    // https://stackoverflow.com/questions/156114/best-way-to-get-result-count-before-limit-was-applied/8242764#8242764
    addFullCountColumn() {
      if (!this.parsedObj) {
        this.parse()
      }

      this.parsedObj[0].SelectStmt.targetList.push({
        "ResTarget": {
          "name": "full_count",
          "val": {
            "FuncCall": {
              "funcname": [
                {
                  "String": {
                    "str": "count"
                  }
                }
              ],
              "agg_star": true,
              "over": {
                "WindowDef": {
                  "frameOptions": 530,
                  "location": 23
                }
              },
              "location": 10
            }
          },
          "location": 10
        }
      })
      return this
    }
  }
}
