import test from 'node:test'
import assert from 'node:assert/strict'
import { parseSalesQuery } from '../lib/salesQuery.js'

test('usa valores seguros por defecto para el historial', () => {
  assert.deepEqual(parseSalesQuery(), {
    search: '',
    from: '',
    to: '',
    page: 1,
    pageSize: 10,
    sortBy: 'date',
    order: 'desc',
  })
})

test('acepta búsqueda, fechas, paginación y orden válidos', () => {
  assert.deepEqual(parseSalesQuery({
    search: '  Ana  ',
    from: '2026-01-01',
    to: '2026-01-31',
    page: '3',
    pageSize: '25',
    sortBy: 'amount',
    order: 'asc',
  }), {
    search: 'Ana',
    from: '2026-01-01',
    to: '2026-01-31',
    page: 3,
    pageSize: 25,
    sortBy: 'amount',
    order: 'asc',
  })
})

test('descarta opciones de paginación y orden no permitidas', () => {
  const result = parseSalesQuery({ page: '-2', pageSize: '500', sortBy: 'DROP TABLE', order: 'sideways' })
  assert.equal(result.page, 1)
  assert.equal(result.pageSize, 10)
  assert.equal(result.sortBy, 'date')
  assert.equal(result.order, 'desc')
})

test('rechaza fechas inexistentes y rangos invertidos', () => {
  assert.throws(() => parseSalesQuery({ from: '2026-02-30' }), /fecha inicial/i)
  assert.throws(() => parseSalesQuery({ to: '23-09-2026' }), /fecha final/i)
  assert.throws(() => parseSalesQuery({ from: '2026-10-01', to: '2026-09-01' }), /posterior/i)
})
