import { useCallback, useEffect, useState } from 'react'
import './AdminDashboard.css'

const number = new Intl.NumberFormat('es-MX')
const customerTypeOptions = [
  { id: 'all', label: 'Todos' },
  { id: '1', label: 'Tipo 1' },
  { id: '2', label: 'Tipo 2' },
  { id: '3', label: 'Tipo 3' },
]

function formatDate(value) {
  if (!value) return 'Sin pedidos'
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatMoney(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

async function requestJson(url) {
  const response = await fetch(url)
  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    throw new Error('La API no está disponible. Abre la aplicación desde el puerto 3001 o inicia el proxy de Vite.')
  }

  const body = await response.json()
  if (!response.ok) throw new Error(body.error || 'No se pudo consultar la información.')
  return body
}

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [customerId, setCustomerId] = useState('')
  const [sales, setSales] = useState([])
  const [customersByType, setCustomersByType] = useState([])
  const [selectedType, setSelectedType] = useState('all')
  const [metricsStatus, setMetricsStatus] = useState('idle')
  const [salesStatus, setSalesStatus] = useState('loading')
  const [typesStatus, setTypesStatus] = useState('loading')
  const [error, setError] = useState('')

  const loadSales = useCallback(async () => {
    setSalesStatus('loading')
    try {
      const body = await requestJson('/api/admin/sales-summary')
      setSales(body.sales)
      setSalesStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setSalesStatus('error')
    }
  }, [])

  const loadCustomerTypes = useCallback(async (type) => {
    setTypesStatus('loading')
    try {
      const body = await requestJson(`/api/admin/customer-types?type=${type}`)
      setCustomersByType(body.customers)
      setTypesStatus('success')
    } catch (requestError) {
      setError(requestError.message)
      setTypesStatus('error')
    }
  }, [])

  useEffect(() => {
    loadSales()
    loadCustomerTypes('all')
  }, [loadCustomerTypes, loadSales])

  const searchMetrics = async (event) => {
    event.preventDefault()
    const id = Number(customerId)
    if (!Number.isInteger(id) || id <= 0) {
      setError('Ingresa un ID de cliente válido.')
      setMetricsStatus('error')
      return
    }

    setMetricsStatus('loading')
    setError('')
    try {
      const body = await requestJson(`/api/admin/customer-metrics?customerId=${id}`)
      setMetrics(body.metrics)
      setMetricsStatus('success')
    } catch (requestError) {
      setMetrics(null)
      setError(requestError.message)
      setMetricsStatus('error')
    }
  }

  const filterLabel = customerTypeOptions.find((type) => type.id === selectedType)?.label

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/admin" aria-label="Ir al panel de MixShop">
          <span className="logo-mark">M</span>
          <span>
            <strong>MixShop</strong>
            <small>Centro de vendedores</small>
          </span>
        </a>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <a className="active" href="#resumen">Resumen</a>
          <a href="#clientes">Clientes</a>
          <a href="#ventas">Ventas</a>
        </nav>

        <a className="store-link" href="/tienda">Ver tienda</a>
      </header>

      <main className="admin-main" id="resumen">
        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">Panel de control</p>
            <h1>Tu negocio, en una sola vista.</h1>
            <p>Analiza clientes y actividad con las métricas calculadas por la base de datos.</p>
          </div>
          <span className="updated-at">Vistas SQL conectadas</span>
        </section>

        <section className="view-grid">
          <article className="dashboard-card metrics-panel">
            <div className="card-heading">
              <div><p className="admin-eyebrow">vista_metricas_clientes</p><h2>Métricas por cliente</h2></div>
            </div>
            <form className="customer-search" onSubmit={searchMetrics}>
              <label htmlFor="customer-id">ID del cliente</label>
              <div><input id="customer-id" type="number" min="1" value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="Ej. 3" /><button type="submit">Buscar</button></div>
            </form>
            {metricsStatus === 'loading' && <p className="view-message">Consultando la vista...</p>}
            {metricsStatus === 'error' && <p className="view-message error-text">{error}</p>}
            {metrics && (
              <div className="metric-detail-grid">
                <div><span>Cliente</span><strong>#{metrics.Id_cliente}</strong></div>
                <div><span>Tipo de cliente</span><strong>{metrics.Tipo_de_cliente}</strong></div>
                <div><span>Total de ventas</span><strong>{number.format(metrics.Total_ventas)}</strong></div>
                <div><span>Total consumido</span><strong>{formatMoney(metrics.Total_consumo)}</strong></div>
                <div><span>Último pedido</span><strong>{formatDate(metrics.Ultima_Fecha_pedido)}</strong></div>
                <div><span>Últimas 10 ventas</span><strong>{formatMoney(metrics.Consumo_reciente_ultimos_10)}</strong></div>
                <div><span>Mes actual</span><strong>{metrics.Pedidos_mes_Act}</strong></div>
                <div><span>Mes 1 / 2 / 3</span><strong>{metrics.Pedidos_mes_1} / {metrics.Pedidos_mes_2} / {metrics.Pedidos_mes_3}</strong></div>
              </div>
            )}
            {!metrics && metricsStatus === 'idle' && <p className="view-message">Escribe un ID para consultar sus métricas.</p>}
          </article>

          <article className="dashboard-card types-panel" id="clientes">
            <div className="card-heading"><div><p className="admin-eyebrow">vista_tipos_clientes</p><h2>Clientes por tipo</h2></div></div>
            <div className="type-selector" role="group" aria-label="Filtrar tipos de cliente">
              {customerTypeOptions.map((type) => <button type="button" key={type.id} className={selectedType === type.id ? 'active' : ''} onClick={() => { setSelectedType(type.id); loadCustomerTypes(type.id) }}>{type.label}</button>)}
            </div>
            <div className="table-scroll compact-table">
              <table><thead><tr><th>ID</th><th>Cliente</th><th>Tipo</th><th>Descripción</th></tr></thead><tbody>
                {customersByType.map((customer) => <tr key={customer.Id_cliente}><td>#{customer.Id_cliente}</td><td><strong>{customer.Nombre_cliente}</strong></td><td>{customer.Tipo_cliente_id}</td><td><span className="type-badge">{customer.Tipo_cliente_descripcion}</span></td></tr>)}
              </tbody></table>
              {typesStatus === 'loading' && <p className="empty-table">Consultando tipos...</p>}
              {typesStatus === 'success' && !customersByType.length && <p className="empty-table">No hay clientes en este tipo.</p>}
            </div>
          </article>

          <article className="dashboard-card sales-panel" id="ventas">
            <div className="card-heading"><div><p className="admin-eyebrow">vista_resumen_ventas</p><h2>Resumen de ventas</h2></div><span>{number.format(sales.length)} registros</span></div>
            <div className="table-scroll">
              <table><thead><tr><th>Venta</th><th>Fecha</th><th>Cliente</th><th>Tipo</th><th>Producto</th><th>Precio</th></tr></thead><tbody>
                {sales.map((sale) => <tr key={sale.Id_venta}><td>#{sale.Id_venta}</td><td>{formatDate(sale.Fecha_venta)}</td><td><strong>{sale.Cliente}</strong></td><td>{sale.Telefono}</td><td>{sale.Producto}</td><td><strong>{formatMoney(sale.Precio)}</strong></td></tr>)}
              </tbody></table>
              {salesStatus === 'loading' && <p className="empty-table">Consultando ventas...</p>}
              {salesStatus === 'success' && !sales.length && <p className="empty-table">No hay ventas registradas.</p>}
              {salesStatus === 'error' && <p className="empty-table error-text">{error}</p>}
            </div>
          </article>
        </section>
      </main>

      <footer className="admin-footer">
        <span>MixShop · Centro de vendedores</span>
        <span>Las clasificaciones se calculan con los datos actuales de MySQL.</span>
      </footer>
    </div>
  )
}

export default AdminDashboard
