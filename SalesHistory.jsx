import { useCallback, useEffect, useState } from 'react'

const currency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

const number = new Intl.NumberFormat('es-MX')
const dateTime = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const emptyFilters = { search: '', from: '', to: '' }

function SalesHistory() {
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [activeFilters, setActiveFilters] = useState(emptyFilters)
  const [sales, setSales] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const loadSales = useCallback(async (signal) => {
    setStatus('loading')
    setError('')
    setSales([])

    const parameters = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy: sort.sortBy,
      order: sort.order,
    })

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) parameters.set(key, value)
    })

    try {
      const response = await fetch(`/api/admin/sales?${parameters}`, { signal })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'No se pudo cargar el historial de ventas.')

      setSales(body.sales)
      setPagination(body.pagination)
      setStatus('success')
    } catch (requestError) {
      if (requestError.name === 'AbortError') return
      setError(requestError.message)
      setStatus('error')
    }
  }, [activeFilters, page, pageSize, sort])

  useEffect(() => {
    const controller = new AbortController()
    loadSales(controller.signal)
    return () => controller.abort()
  }, [loadSales])

  const applyFilters = (event) => {
    event.preventDefault()

    if (draftFilters.from && draftFilters.to && draftFilters.from > draftFilters.to) {
      setError('La fecha inicial no puede ser posterior a la fecha final.')
      setStatus('error')
      return
    }

    setPage(1)
    setActiveFilters({
      search: draftFilters.search.trim(),
      from: draftFilters.from,
      to: draftFilters.to,
    })
  }

  const clearFilters = () => {
    setDraftFilters(emptyFilters)
    setActiveFilters(emptyFilters)
    setPage(1)
  }

  const changeSort = (sortBy) => {
    setPage(1)
    setSort((current) => ({
      sortBy,
      order: current.sortBy === sortBy && current.order === 'desc' ? 'asc' : 'desc',
    }))
  }

  const sortIndicator = (column) => {
    if (sort.sortBy !== column) return '↕'
    return sort.order === 'asc' ? '↑' : '↓'
  }

  const ariaSort = (column) => {
    if (sort.sortBy !== column) return 'none'
    return sort.order === 'asc' ? 'ascending' : 'descending'
  }

  return (
    <section className="dashboard-card sales-history" id="ventas">
      <div className="card-heading sales-heading">
        <div>
          <p className="admin-eyebrow">Operación</p>
          <h2>Historial de ventas</h2>
          <p>Consulta todos los pedidos registrados y localiza la actividad de cada cliente.</p>
        </div>
        <span>{number.format(pagination.total)} ventas</span>
      </div>

      <form className="sales-filters" onSubmit={applyFilters}>
        <label className="sales-search">
          <span>Cliente o ID</span>
          <input
            type="search"
            value={draftFilters.search}
            onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Ej. Ana Martínez o 12"
          />
        </label>
        <label>
          <span>Desde</span>
          <input
            type="date"
            value={draftFilters.from}
            max={draftFilters.to || undefined}
            onChange={(event) => setDraftFilters((current) => ({ ...current, from: event.target.value }))}
          />
        </label>
        <label>
          <span>Hasta</span>
          <input
            type="date"
            value={draftFilters.to}
            min={draftFilters.from || undefined}
            onChange={(event) => setDraftFilters((current) => ({ ...current, to: event.target.value }))}
          />
        </label>
        <div className="sales-filter-actions">
          <button type="submit" className="filter-submit">Buscar</button>
          <button type="button" className="filter-clear" onClick={clearFilters}>Limpiar</button>
        </div>
      </form>

      <div className="sales-table-meta">
        <p>
          {pagination.total
            ? `Mostrando ${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} de ${number.format(pagination.total)}`
            : 'Sin resultados'}
        </p>
        <label>
          Filas por página
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setPage(1)
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>

      {status === 'error' && (
        <div className="sales-feedback error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => loadSales()}>Reintentar</button>
        </div>
      )}

      <div className="table-scroll sales-table-wrap" aria-busy={status === 'loading'}>
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th aria-sort={ariaSort('date')}>
                <button type="button" className="sort-button" onClick={() => changeSort('date')}>
                  Fecha <span>{sortIndicator('date')}</span>
                </button>
              </th>
              <th>Productos</th>
              <th aria-sort={ariaSort('amount')}>
                <button type="button" className="sort-button" onClick={() => changeSort('amount')}>
                  Monto total <span>{sortIndicator('amount')}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td><span className="sale-id">#{sale.id}</span></td>
                <td>
                  <div className="sale-customer">
                    <strong>{sale.customer.name}</strong>
                    <small>ID {sale.customer.id}</small>
                  </div>
                </td>
                <td>{dateTime.format(new Date(sale.saleDate))}</td>
                <td>
                  <div className="sale-products">
                    {sale.products.map((product) => <span key={product.id}>{product.name}</span>)}
                  </div>
                </td>
                <td><strong>{currency.format(sale.totalAmount)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>

        {status === 'loading' && <p className="empty-table">Cargando ventas…</p>}
        {status === 'success' && !sales.length && (
          <p className="empty-table">No hay ventas que coincidan con los filtros.</p>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Paginación del historial de ventas">
          <button type="button" disabled={page <= 1 || status === 'loading'} onClick={() => setPage((current) => current - 1)}>
            Anterior
          </button>
          <span>Página <strong>{pagination.page}</strong> de {pagination.totalPages}</span>
          <button type="button" disabled={page >= pagination.totalPages || status === 'loading'} onClick={() => setPage((current) => current + 1)}>
            Siguiente
          </button>
        </nav>
      )}
    </section>
  )
}

export default SalesHistory
