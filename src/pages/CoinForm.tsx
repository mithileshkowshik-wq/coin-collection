import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createCoin, getCoin, updateCoin } from '../lib/coins'
import type { CoinInput } from '../types'

// Form state keeps everything as strings; converted to typed values on save.
interface FormState {
  country: string
  year: string
  denomination: string
  currency_name: string
  mint_mark: string
  material: string
  weight_g: string
  diameter_mm: string
  grade: string
  quantity: string
  estimated_value: string
  value_currency: string
  acquired_date: string
  acquired_place: string
  acquired_price: string
  notes: string
}

const EMPTY: FormState = {
  country: '',
  year: '',
  denomination: '',
  currency_name: '',
  mint_mark: '',
  material: '',
  weight_g: '',
  diameter_mm: '',
  grade: '',
  quantity: '1',
  estimated_value: '',
  value_currency: 'USD',
  acquired_date: '',
  acquired_place: '',
  acquired_price: '',
  notes: '',
}

const COMMON_GRADES = ['PO-1', 'FR-2', 'AG-3', 'G-4', 'VG-8', 'F-12', 'VF-20', 'VF-30', 'XF-40', 'AU-50', 'AU-58', 'MS-60', 'MS-63', 'MS-65', 'MS-67', 'MS-70', 'Proof']

function toInput(form: FormState): CoinInput {
  const num = (s: string) => (s.trim() === '' ? null : Number(s))
  const text = (s: string) => (s.trim() === '' ? null : s.trim())
  return {
    country: form.country.trim(),
    year: num(form.year),
    denomination: text(form.denomination),
    currency_name: text(form.currency_name),
    mint_mark: text(form.mint_mark),
    material: text(form.material),
    weight_g: num(form.weight_g),
    diameter_mm: num(form.diameter_mm),
    grade: text(form.grade),
    quantity: Math.max(1, Number(form.quantity) || 1),
    estimated_value: num(form.estimated_value),
    value_currency: text(form.value_currency) ?? 'USD',
    acquired_date: text(form.acquired_date),
    acquired_place: text(form.acquired_place),
    acquired_price: num(form.acquired_price),
    notes: text(form.notes),
    numista_id: null,
  }
}

export default function CoinForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [numistaId, setNumistaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getCoin(id)
      .then((coin) => {
        if (cancelled) return
        setNumistaId(coin.numista_id)
        setForm({
          country: coin.country,
          year: coin.year?.toString() ?? '',
          denomination: coin.denomination ?? '',
          currency_name: coin.currency_name ?? '',
          mint_mark: coin.mint_mark ?? '',
          material: coin.material ?? '',
          weight_g: coin.weight_g?.toString() ?? '',
          diameter_mm: coin.diameter_mm?.toString() ?? '',
          grade: coin.grade ?? '',
          quantity: coin.quantity.toString(),
          estimated_value: coin.estimated_value?.toString() ?? '',
          value_currency: coin.value_currency ?? 'USD',
          acquired_date: coin.acquired_date ?? '',
          acquired_place: coin.acquired_place ?? '',
          acquired_price: coin.acquired_price?.toString() ?? '',
          notes: coin.notes ?? '',
        })
        setLoading(false)
      })
      .catch((e: Error) => {
        if (cancelled) return
        setError(e.message)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const input = { ...toInput(form), numista_id: numistaId }
      const saved = isEdit ? await updateCoin(id!, input) : await createCoin(input)
      navigate(`/coins/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setSaving(false)
    }
  }

  if (loading) return <p className="py-10 text-center text-stone-500">Loading…</p>

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{isEdit ? 'Edit coin' : 'Add a coin'}</h1>
        <Link to={isEdit ? `/coins/${id}` : '/'} className="text-sm text-stone-500 hover:text-stone-800">
          Cancel
        </Link>
      </div>

      <Section title="Identification">
        <Field label="Country *">
          <input required value={form.country} onChange={set('country')} className={inputCls} placeholder="United States" />
        </Field>
        <Field label="Year">
          <input type="number" value={form.year} onChange={set('year')} className={inputCls} placeholder="1921" />
        </Field>
        <Field label="Denomination">
          <input value={form.denomination} onChange={set('denomination')} className={inputCls} placeholder="1 Dollar" />
        </Field>
        <Field label="Currency name">
          <input value={form.currency_name} onChange={set('currency_name')} className={inputCls} placeholder="US Dollar" />
        </Field>
        <Field label="Mint mark">
          <input value={form.mint_mark} onChange={set('mint_mark')} className={inputCls} placeholder="S" />
        </Field>
      </Section>

      <Section title="Physical details">
        <Field label="Material / metal">
          <input value={form.material} onChange={set('material')} className={inputCls} placeholder="Silver .900" />
        </Field>
        <Field label="Weight (g)">
          <input type="number" step="any" value={form.weight_g} onChange={set('weight_g')} className={inputCls} placeholder="26.73" />
        </Field>
        <Field label="Diameter (mm)">
          <input type="number" step="any" value={form.diameter_mm} onChange={set('diameter_mm')} className={inputCls} placeholder="38.1" />
        </Field>
        <Field label="Condition / grade">
          <input list="grades" value={form.grade} onChange={set('grade')} className={inputCls} placeholder="MS-63" />
          <datalist id="grades">
            {COMMON_GRADES.map((g) => <option key={g} value={g} />)}
          </datalist>
        </Field>
        <Field label="Quantity">
          <input type="number" min={1} value={form.quantity} onChange={set('quantity')} className={inputCls} />
        </Field>
      </Section>

      <Section title="Value & acquisition">
        <Field label="Estimated value">
          <input type="number" step="any" value={form.estimated_value} onChange={set('estimated_value')} className={inputCls} placeholder="45.00" />
        </Field>
        <Field label="Value currency">
          <input value={form.value_currency} onChange={set('value_currency')} className={inputCls} placeholder="USD" />
        </Field>
        <Field label="Acquired on">
          <input type="date" value={form.acquired_date} onChange={set('acquired_date')} className={inputCls} />
        </Field>
        <Field label="Acquired from / where">
          <input value={form.acquired_place} onChange={set('acquired_place')} className={inputCls} placeholder="Estate sale, San Jose" />
        </Field>
        <Field label="Purchase price">
          <input type="number" step="any" value={form.acquired_price} onChange={set('acquired_price')} className={inputCls} placeholder="30.00" />
        </Field>
      </Section>

      <Section title="Notes">
        <label className="block sm:col-span-2">
          <textarea
            rows={4}
            value={form.notes}
            onChange={set('notes')}
            className={inputCls}
            placeholder="Anything worth remembering about this coin…"
          />
        </label>
      </Section>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-stone-900 py-3 font-semibold text-amber-50 shadow hover:bg-stone-800 disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add coin'}
      </button>
    </form>
  )
}

const inputCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-500">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">{label}</span>
      {children}
    </label>
  )
}
