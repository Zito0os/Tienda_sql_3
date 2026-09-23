const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const PAGE_SIZES = new Set([10, 25, 50])
const SORT_COLUMNS = new Set(['date', 'amount'])

function isValidIsoDate(value) {
  if (!ISO_DATE_PATTERN.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

export function parseSalesQuery(query = {}) {
  const search = String(query.search || '').trim().slice(0, 100)
  const from = String(query.from || '').trim()
  const to = String(query.to || '').trim()

  if (from && !isValidIsoDate(from)) {
    throw new TypeError('La fecha inicial no es válida.')
  }

  if (to && !isValidIsoDate(to)) {
    throw new TypeError('La fecha final no es válida.')
  }

  if (from && to && from > to) {
    throw new TypeError('La fecha inicial no puede ser posterior a la fecha final.')
  }

  const requestedPage = Number.parseInt(query.page, 10)
  const requestedPageSize = Number.parseInt(query.pageSize, 10)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const pageSize = PAGE_SIZES.has(requestedPageSize) ? requestedPageSize : 10
  const sortBy = SORT_COLUMNS.has(query.sortBy) ? query.sortBy : 'date'
  const order = String(query.order || '').toLowerCase() === 'asc' ? 'asc' : 'desc'

  return { search, from, to, page, pageSize, sortBy, order }
}

