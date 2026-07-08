import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCoins } from '../lib/coins'
import { formatMoney } from '../lib/format'
import type { Coin } from '../types'

type SortKey = 'newest' | 'year' | 'country' | 'value'

export default function CoinList() {
  const [coins, setCoins] = useState<Coin[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  useEffect(() => {
    listCoins()
      .then(setCoins)
      .catch((e: Error) => setError(e.message))
  }, [])

  const countries = useMemo(
    () => [...new Set((coins ?? []).map((c) => c.country))].sort(),
    [coins],
  )

  const visible = useMemo(() => {
    let result = coins ?? []
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((c) =>
        [c.country, c.denomination, c.currency_name, c.material, c.grade, c.mint_mark, c.notes, c.year?.toString()]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q)),
      )
    }
    if (country) result = result.filter((c) => c.country === country)
    const sorted = [...result]
    if (sort === 'year') sorted.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))
    if (sort === 'country') sorted.sort((a, b) => a.country.localeCompare(b.country))
    if (sort === 'value') sorted.sort((a, b) => (b.estimated_value ?? -1) - (a.estimated_value ?? -1))
    return sorted
  }, [coins, query, country, sort])

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-red-700">
        Couldn’t load coins: {error}
      </div>
    )
  }

  if (!coins) {
    return <p className="py-10 text-center text-stone-500">Loading collection…</p>
  }

  const totalQuantity = coins.reduce((sum, c) => sum + (c.quantity || 1), 0)
  const mainCurrency = coins.find((c) => c.estimated_value != null)?.value_currency ?? 'USD'
  // Only sum coins valued in the same currency as the total — mixing currencies would produce a meaningless number.
  const totalValue = coins
    .filter((c) => c.value_currency === mainCurrency)
    .reduce((sum, c) => sum + (c.estimated_value ?? 0) * (c.quantity || 1), 0)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-bold">
          {totalQuantity} coin{totalQuantity === 1 ? '' : 's'}
          <span className="ml-2 text-sm font-normal text-stone-500">
            est. {formatMoney(totalValue, mainCurrency)}
          </span>
        </h1>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Search country, year, denomination…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 basis-52 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          <option value="newest">Recently added</option>
          <option value="year">Year (oldest first)</option>
          <option value="country">Country A–Z</option>
          <option value="value">Highest value</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-300 p-10 text-center text-stone-500">
          {coins.length === 0 ? (
            <>
              <p className="mb-3 text-lg">Your collection is empty.</p>
              <Link
                to="/coins/new"
                className="inline-block rounded-lg bg-amber-400 px-4 py-2 font-semibold text-stone-900 hover:bg-amber-300"
              >
                Add your first coin
              </Link>
            </>
          ) : (
            <p>No coins match your search.</p>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((coin) => (
            <li key={coin.id}>
              <Link
                to={`/coins/${coin.id}`}
                className="block rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200 transition hover:shadow-md hover:ring-amber-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {coin.denomination || 'Unknown denomination'}
                      {coin.year ? ` · ${coin.year}` : ''}
                    </p>
                    <p className="truncate text-sm text-stone-500">
                      {coin.country}
                      {coin.material ? ` · ${coin.material}` : ''}
                    </p>
                  </div>
                  {coin.grade && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      {coin.grade}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-stone-500">
                    Qty {coin.quantity}
                    {coin.mint_mark ? ` · Mint ${coin.mint_mark}` : ''}
                  </span>
                  <span className="font-semibold text-stone-800">
                    {formatMoney(coin.estimated_value, coin.value_currency)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
