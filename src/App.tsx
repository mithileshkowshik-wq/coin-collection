import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Layout from './components/Layout'
import SetupScreen from './pages/SetupScreen'
import Login from './pages/Login'
import CoinList from './pages/CoinList'
import CoinDetail from './pages/CoinDetail'
import CoinForm from './pages/CoinForm'

function AuthedApp() {
  const { session, loading } = useAuth()

  if (loading) {
    return <p className="grid min-h-dvh place-items-center text-stone-500">Loading…</p>
  }
  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<CoinList />} />
        <Route path="/coins/new" element={<CoinForm />} />
        <Route path="/coins/:id" element={<CoinDetail />} />
        <Route path="/coins/:id/edit" element={<CoinForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupScreen />
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthedApp />
      </AuthProvider>
    </BrowserRouter>
  )
}
