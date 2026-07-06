import { getSupabase } from './supabase'
import type { Coin, CoinInput } from '../types'

export async function listCoins(): Promise<Coin[]> {
  const { data, error } = await getSupabase()
    .from('coins')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Coin[]
}

export async function getCoin(id: string): Promise<Coin> {
  const { data, error } = await getSupabase().from('coins').select('*').eq('id', id).single()
  if (error) throw error
  return data as Coin
}

export async function createCoin(input: CoinInput): Promise<Coin> {
  const { data, error } = await getSupabase().from('coins').insert(input).select().single()
  if (error) throw error
  return data as Coin
}

export async function updateCoin(id: string, input: CoinInput): Promise<Coin> {
  const { data, error } = await getSupabase()
    .from('coins')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Coin
}

export async function deleteCoin(id: string): Promise<void> {
  const { error } = await getSupabase().from('coins').delete().eq('id', id)
  if (error) throw error
}
