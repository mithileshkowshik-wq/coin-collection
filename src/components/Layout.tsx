import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Layout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-dvh bg-stone-100 text-stone-900">
      <header className="sticky top-0 z-10 bg-stone-900 text-amber-50 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-amber-400 text-base text-stone-900 shadow-inner">
              ¢
            </span>
            Coin Collection
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/coins/new"
              className="rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-semibold text-stone-900 hover:bg-amber-300"
            >
              + Add coin
            </Link>
            <button
              onClick={() => void signOut()}
              className="rounded-lg px-3 py-1.5 text-sm text-amber-100/80 hover:bg-stone-800 hover:text-amber-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
