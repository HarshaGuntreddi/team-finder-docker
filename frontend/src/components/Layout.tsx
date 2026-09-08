import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Compass,
  Database,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { cn } from '../lib/ui'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/directory', label: 'People Directory', icon: Users },
  { to: '/find-team', label: 'Find My Team', icon: Compass },
  { to: '/manage', label: 'Manage Data', icon: Database },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            )
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-extrabold tracking-tight">Team Finder</div>
        <div className="text-[11px] font-medium text-slate-400">Talent Directory</div>
      </div>
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white/70 px-4 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 lg:flex">
        <Brand />
        <NavItems />
        <div className="mt-auto rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          Data is stored locally in your browser. Use <span className="font-semibold">Manage Data</span> to import or export.
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 animate-slide-in bg-white px-4 py-5 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button className="btn-ghost !px-2 !py-2" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:px-6">
          <button
            className="btn-ghost !px-2 !py-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold sm:text-lg">Team & Talent Finder</h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Discover who does what, find the right team, and keep records up to date.
            </p>
          </div>
          <button
            className="btn-outline ml-auto !px-2.5 !py-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle light / dark"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
