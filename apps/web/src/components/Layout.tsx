import { Outlet, Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/text-compare', label: 'Text Compare' },
  { to: '/json-prettifier', label: 'JSON Prettifier' },
]

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            Dev Tools
          </Link>
          <nav className="flex items-center gap-4">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm transition-colors ${
                  location.pathname === to
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={`flex-1 ${isHome ? '' : 'flex flex-col'}`}>
        <Outlet />
      </main>
    </div>
  )
}
