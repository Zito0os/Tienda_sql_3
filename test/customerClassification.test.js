import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyCustomer } from '../lib/customerClassification.js'

const now = new Date('2026-09-23T12:00:00.000Z')

test('clasifica como alto nivel solo si supera ambos límites de valor', () => {
  assert.equal(classifyCustomer({ orderCount: 11, totalSpent: 20001, ordersByMonth: [0, 0, 0, 0] }, now), 'high')
  assert.equal(classifyCustomer({ orderCount: 10, totalSpent: 25000, ordersByMonth: [0, 0, 0, 0] }, now), 'risk')
})

test('clasifica como alto nivel con al menos 4 pedidos en cada uno de 4 meses', () => {
  assert.equal(classifyCustomer({ orderCount: 16, totalSpent: 3000, lastOrder: '2026-09-20', ordersByMonth: [4, 5, 4, 7] }, now), 'high')
  assert.equal(classifyCustomer({ orderCount: 16, totalSpent: 12000, lastOrder: '2026-09-20', ordersByMonth: [4, 3, 4, 7] }, now), 'normal')
})

test('alto nivel conserva prioridad aunque el último pedido tenga más de 90 días', () => {
  assert.equal(classifyCustomer({ orderCount: 12, totalSpent: 30000, lastOrder: '2026-01-01', ordersByMonth: [0, 0, 0, 0] }, now), 'high')
})

test('clasifica en riesgo por gasto bajo, inactividad o ausencia de pedidos', () => {
  assert.equal(classifyCustomer({ orderCount: 2, totalSpent: 4999, lastOrder: '2026-09-20', ordersByMonth: [2, 0, 0, 0] }, now), 'risk')
  assert.equal(classifyCustomer({ orderCount: 3, totalSpent: 7000, lastOrder: '2026-06-01', ordersByMonth: [0, 0, 0, 0] }, now), 'risk')
  assert.equal(classifyCustomer({ orderCount: 0, totalSpent: 0, lastOrder: null, ordersByMonth: [0, 0, 0, 0] }, now), 'risk')
})

test('clasifica como normal si no cumple ninguna condición anterior', () => {
  assert.equal(classifyCustomer({ orderCount: 3, totalSpent: 7000, lastOrder: '2026-09-01', ordersByMonth: [1, 1, 1, 0] }, now), 'normal')
})
