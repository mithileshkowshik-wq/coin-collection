export interface Coin {
  id: string
  country: string
  year: number | null
  denomination: string | null
  currency_name: string | null
  mint_mark: string | null
  material: string | null
  weight_g: number | null
  diameter_mm: number | null
  grade: string | null
  quantity: number
  estimated_value: number | null
  value_currency: string | null
  acquired_date: string | null
  acquired_place: string | null
  acquired_price: number | null
  notes: string | null
  numista_id: number | null
  created_at: string
  updated_at: string
}

export type CoinInput = Omit<Coin, 'id' | 'created_at' | 'updated_at'>

export interface CoinPhoto {
  id: string
  coin_id: string
  photo_url: string
  is_primary: boolean
  created_at: string
}
