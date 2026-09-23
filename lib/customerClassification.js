export const CUSTOMER_TYPES = {
  ALL: 'all',
  NORMAL: 'normal',
  RISK: 'risk',
  HIGH: 'high',
}

export const CUSTOMER_TYPE_LABELS = {
  [CUSTOMER_TYPES.ALL]: 'Todos',
  [CUSTOMER_TYPES.NORMAL]: 'Normal',
  [CUSTOMER_TYPES.RISK]: 'En riesgo',
  [CUSTOMER_TYPES.HIGH]: 'Alto nivel',
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

export function classifyCustomer(customer, now = new Date()) {
  const orderCount = Number(customer.orderCount) || 0
  const totalSpent = Number(customer.totalSpent) || 0
  const ordersByMonth = Array.isArray(customer.ordersByMonth)
    ? customer.ordersByMonth.map((value) => Number(value) || 0)
    : []

  const isHighByValue = orderCount > 10 && totalSpent > 20000
  const isHighByFrequency = ordersByMonth.length >= 4 && ordersByMonth.slice(0, 4).every((orders) => orders >= 4)

  // Alto nivel siempre tiene prioridad sobre cualquier condición de riesgo.
  if (isHighByValue || isHighByFrequency) {
    return CUSTOMER_TYPES.HIGH
  }

  const lastOrder = customer.lastOrder ? new Date(customer.lastOrder) : null
  const daysSinceLastOrder = lastOrder && !Number.isNaN(lastOrder.getTime())
    ? Math.floor((now.getTime() - lastOrder.getTime()) / DAY_IN_MS)
    : Number.POSITIVE_INFINITY

  if (totalSpent < 5000 || daysSinceLastOrder > 90) {
    return CUSTOMER_TYPES.RISK
  }

  return CUSTOMER_TYPES.NORMAL
}

