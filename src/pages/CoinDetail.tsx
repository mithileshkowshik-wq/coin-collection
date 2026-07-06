import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteCoin, getCoin } from '../lib/coins'
import { formatDate, formatMoney } from '../lib/format'
import type { Coin } from '../types'

export default function CoinDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [coin, setCoin] = useState<Coin | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getCoin(id)
      .then(setCoin)
      .catch((e: Error) => setError(e.message))
  }, [id])

  const onDelete = async () => {
    if (!coin) return
    if (!window.confirm(`Delete "${coin.denomination ?? 'this coin'} (${coin.country}${coin.year ? ` ${coin.year}` : ''})"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteCoin(coin.id)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  if (error) return <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
  if (!coin) return <p className="py-10 text-center text-stone-500">Loading…</p>

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="mb-3 inline-block text-sm text-stone-500 hover:text-stone-800">
        ← Back to collection
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {coin.denomination || 'Unknown denomination'}
            {coin.year ? ` · ${coin.year}` : ''}
          </h1>
          <p className="text-stone-500">
            {coin.country}
            {coin.grade ? ` · ${coin.grade}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/coins/${coin.id}/edit`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-stone-800"
          >
            Edit
          </Link>
          <button
            onClick={() => void onDelete()}
            disabled={deleting}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Photos land here in Phase 2 */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
        <dl className="divide-y divide-stone-100">
          <Row label="Country" value={coin.country} />
          <Row label="Year" value={coin.year?.toString()} />
          <Row label="Denomination" value={coin.denomination} />
          <Row label="Currency" value={coin.currency_name} />
          <Row label="Mint mark" value={coin.mint_mark} />
          <Row label="Material" value={coin.material} />
          <Row label="Weight" value={coin.weight_g != null ? `${coin.weight_g} g` : null} />
          <Row label="Diameter" value={coin.diameter_mm != null ? `${coin.diameter_mm} mm` : null} />
          <Row label="Grade" value={coin.grade} />
          <Row label="Quantity" value={coin.quantity.toString()} />
          <Row label="Estimated value" value={formatMoney(coin.estimated_value, coin.value_currency)} />
          <Row label="Acquired" value={formatDate(coin.acquired_date)} />
          <Row label="Acquired from" value={coin.acquired_place} />
          <Row label="Purchase price" value={coin.acquired_price != null ? formatMoney(coin.acquired_price, coin.value_currency) : null} />
          {coin.numista_id && (
            <Row
              label="Numista"
              value={
                <a
                  href={`https://en.numista.com/catalogue/pieces${coin.numista_id}.html`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 underline"
                >
                  Catalog entry #{coin.numista_id}
                </a>
              }
            />
          )}
          {coin.notes && <Row label="Notes" value={<span className="whitespace-pre-wrap">{coin.notes}</span>} />}
        </dl>
      </div>

      <p className="mt-3 text-xs text-stone-400">
        Added {new Date(coin.created_at).toLocaleDateString()} · Updated{' '}
        {new Date(coin.updated_at).toLocaleDateString()}
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode | null | undefined }) {
  if (value == null || value === '' || value === '—') return null
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-3 px-5 py-3 text-sm">
      <dt className="font-medium text-stone-500">{label}</dt>
      <dd className="text-stone-900">{value}</dd>
    </div>
  )
}
