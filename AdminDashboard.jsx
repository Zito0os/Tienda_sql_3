import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './AdminDashboard.css'

const customerTypes = [
  { id: 'all', label: 'Todos' },
  { id: 'normal', label: 'Normal' },
  { id: 'risk', label: 'En riesgo' },
  { id: 'high', label: 'Alto nivel' },
]

const typeMeta = {
  normal: { label: 'Normal', color: '#4cc9f0' },
  risk: { label: 'En riesgo', color: '#ff6b6b' },
  high: { label: 'Alto nivel', color: '#9b7bff' },
}

const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const number = new Intl.NumberFormat('es-MX')

function formatDate(value) {
  if (!value) return 'Sin pedidos'
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [selectedType, setSelectedType] = useState('all')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setStatus('loading')
    setError('')

    try {
      const response = await fetch('/api/admin/dashboard')
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'No se pudieron cargar las métricas.')

      setDashboard(body)
      setStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const filteredCustomers = useMemo(() => {
    const customers = dashboard?.customers || []
    if (selectedType === 'all') return customers
    return customers.filter((customer) => customer.type === selectedType)
  }, [dashboard, selectedType])

  const totalSpent = filteredCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const totalOrders = filteredCustomers.reduce((sum, customer) => sum + customer.orderCount, 0)
  const averageSpent = filteredCustomers.length ? totalSpent / filteredCustomers.length : 0

  const distribution = useMemo(
    () => Object.entries(typeMeta).map(([type, meta]) => {
      const customers = (dashboard?.customers || []).filter((customer) => customer.type === type)
      return {
        type,
        name: meta.label,
        customers: customers.length,
        spent: customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
        color: meta.color,
      }
    }),
    [dashboard],
  )

  const filterLabel = customerTypes.find((type) => type.id === selectedType)?.label

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/" aria-label="Ir a la tienda MixShop">
          <span className="logo-mark">M</span>
          <span>
            <strong>MixShop</strong>
            <small>Centro de vendedores</small>
          </span>
        </a>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <a className="active" href="#resumen">Resumen</a>
          <a href="#clientes">Clientes</a>
          <a href="#productos">Productos</a>
        </nav>

        <a className="store-link" href="/">Ver tienda</a>
      </header>

      <main className="admin-main" id="resumen">
        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">Panel de control</p>
            <h1>Tu negocio, en una sola vista.</h1>
            <p>Analiza clientes, actividad y productos con información directa de tus ventas.</p>
          </div>
          {dashboard?.generatedAt && (
            <span className="updated-at">Actualizado {formatDate(dashboard.generatedAt)}</span>
          )}
        </section>

        {status === 'loading' && (
          <section className="admin-state" aria-live="polite">
            <span className="loader" />
            <h2>Preparando tus métricas</h2>
            <p>Estamos consultando la información de MySQL.</p>
          </section>
        )}

        {status === 'error' && (
          <section className="admin-state admin-error" role="alert">
            <span className="state-icon">!</span>
            <h2>No pudimos conectar con los datos</h2>
            <p>{error}</p>
            <button type="button" onClick={loadDashboard}>Intentar de nuevo</button>
          </section>
        )}

        {status === 'success' && (
          <>
            <section className="filter-panel" aria-label="Filtrar métricas por tipo de cliente">
              <div>
                <span>Segmento de clientes</span>
                <strong>{filterLabel}</strong>
              </div>
              <div className="admin-filters">
                {customerTypes.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    className={selectedType === type.id ? 'active' : ''}
                    onClick={() => setSelectedType(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="metric-grid" aria-label={`Métricas de clientes: ${filterLabel}`}>
              <article className="metric-card accent-blue">
                <span className="metric-icon">CL</span>
                <p>Clientes</p>
                <strong>{number.format(filteredCustomers.length)}</strong>
                <small>en el segmento seleccionado</small>
              </article>
              <article className="metric-card accent-violet">
                <span className="metric-icon">$</span>
                <p>Gasto total</p>
                <strong>{currency.format(totalSpent)}</strong>
                <small>acumulado por el grupo</small>
              </article>
              <article className="metric-card accent-coral">
                <span className="metric-icon">VT</span>
                <p>Pedidos</p>
                <strong>{number.format(totalOrders)}</strong>
                <small>ventas registradas</small>
              </article>
              <article className="metric-card accent-gold">
                <span className="metric-icon">Ø</span>
                <p>Promedio por cliente</p>
                <strong>{currency.format(averageSpent)}</strong>
                <small>gasto medio acumulado</small>
              </article>
            </section>

            <section className="chart-grid">
              <article className="dashboard-card">
                <div className="card-heading">
                  <div>
                    <p className="admin-eyebrow">Composición</p>
                    <h2>Distribución de clientes</h2>
                  </div>
                  <span>{dashboard.customers.length} total</span>
                </div>
                <div className="donut-layout">
                  <div className="chart-wrap" role="img" aria-label="Gráfica circular de clientes por clasificación">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={distribution} dataKey="customers" nameKey="name" innerRadius={66} outerRadius={96} paddingAngle={4} stroke="none">
                          {distribution.map((entry) => <Cell key={entry.type} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#11182b', border: '1px solid #283452', borderRadius: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <strong>{dashboard.customers.length}</strong>
                      <span>clientes</span>
                    </div>
                  </div>
                  <div className="chart-legend">
                    {distribution.map((entry) => (
                      <div key={entry.type}>
                        <span className="legend-dot" style={{ background: entry.color }} />
                        <p>{entry.name}<small>{currency.format(entry.spent)}</small></p>
                        <strong>{entry.customers}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="dashboard-card">
                <div className="card-heading">
                  <div>
                    <p className="admin-eyebrow">Valor</p>
                    <h2>Gasto por segmento</h2>
                  </div>
                </div>
                <div className="bar-chart" role="img" aria-label="Gráfica de gasto total por clasificación">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#25304b" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#aebae8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tick={{ fill: '#8793bd', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [currency.format(value), 'Gasto']} cursor={{ fill: 'rgba(255,255,255,.04)' }} contentStyle={{ background: '#11182b', border: '1px solid #283452', borderRadius: 12 }} />
                      <Bar dataKey="spent" radius={[10, 10, 3, 3]}>
                        {distribution.map((entry) => <Cell key={entry.type} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            <section className="table-grid">
              <article className="dashboard-card table-card" id="clientes">
                <div className="card-heading">
                  <div>
                    <p className="admin-eyebrow">Clientes</p>
                    <h2>Top 10 por gasto</h2>
                  </div>
                  <span>{filterLabel}</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>#</th><th>Cliente</th><th>Tipo</th><th>Pedidos</th><th>Último pedido</th><th>Gasto</th></tr></thead>
                    <tbody>
                      {filteredCustomers.slice(0, 10).map((customer, index) => (
                        <tr key={customer.id}>
                          <td><span className="rank">{index + 1}</span></td>
                          <td><strong>{customer.name}</strong></td>
                          <td><span className={`type-badge ${customer.type}`}>{customer.typeLabel}</span></td>
                          <td>{number.format(customer.orderCount)}</td>
                          <td>{formatDate(customer.lastOrder)}</td>
                          <td><strong>{currency.format(customer.totalSpent)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filteredCustomers.length && <p className="empty-table">No hay clientes en este segmento.</p>}
                </div>
              </article>

              <article className="dashboard-card table-card" id="productos">
                <div className="card-heading">
                  <div>
                    <p className="admin-eyebrow">Catálogo</p>
                    <h2>Top 5 productos</h2>
                  </div>
                  <span>por ventas</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>#</th><th>Producto</th><th>Ventas</th><th>Ingresos</th></tr></thead>
                    <tbody>
                      {dashboard.topProducts.map((product, index) => (
                        <tr key={product.id}>
                          <td><span className="rank">{index + 1}</span></td>
                          <td><strong>{product.name}</strong></td>
                          <td>{number.format(product.unitsSold)}</td>
                          <td><strong>{currency.format(product.revenue)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!dashboard.topProducts.length && <p className="empty-table">Todavía no hay productos vendidos.</p>}
                </div>
              </article>
            </section>
          </>
        )}
      </main>

      <footer className="admin-footer">
        <span>MixShop · Centro de vendedores</span>
        <span>Las clasificaciones se calculan con los datos actuales de MySQL.</span>
      </footer>
    </div>
  )
}

export default AdminDashboard
