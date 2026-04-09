import { Link } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-amber-400">
            AI 海龟汤
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/library"
              className="text-slate-300 hover:text-amber-400"
            >
              题库
            </Link>
          </nav>
        </div>
      </header>

      <main
        className="mx-auto max-w-5xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <AppRoutes />
      </main>
    </div>
  )
}
