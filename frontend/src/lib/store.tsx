import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Employee, NewEmployee } from '../types'

// In Docker, nginx proxies /api to the backend. Override with VITE_API_URL for
// local development (e.g. http://localhost:4000/api).
const API = import.meta.env.VITE_API_URL || '/api'
const THEME_KEY = 'team-finder:theme'

type Theme = 'light' | 'dark'

interface StoreValue {
  employees: Employee[]
  loading: boolean
  error: string | null
  addEmployee: (data: NewEmployee) => Promise<void>
  updateEmployee: (id: string, data: NewEmployee) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  replaceAll: (employees: Employee[]) => Promise<void>
  mergeIn: (employees: Employee[]) => Promise<void>
  resetToSample: () => Promise<void>
  theme: Theme
  toggleTheme: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function loadTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(loadTheme)

  // Load employees from the API on mount.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const data = await api<Employee[]>('/employees')
        if (active) setEmployees(data)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load data')
        console.error(err)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Apply + persist theme (UI preference stays client-side).
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const run = useCallback(async (fn: () => Promise<void>) => {
    try {
      setError(null)
      await fn()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed'
      setError(msg)
      console.error(err)
      alert('Something went wrong talking to the server:\n' + msg)
    }
  }, [])

  const addEmployee = useCallback(
    (data: NewEmployee) =>
      run(async () => {
        const created = await api<Employee>('/employees', {
          method: 'POST',
          body: JSON.stringify(data),
        })
        setEmployees((prev) => [created, ...prev])
      }),
    [run],
  )

  const updateEmployee = useCallback(
    (id: string, data: NewEmployee) =>
      run(async () => {
        const updated = await api<Employee>(`/employees/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        })
        setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
      }),
    [run],
  )

  const deleteEmployee = useCallback(
    (id: string) =>
      run(async () => {
        await api<void>(`/employees/${id}`, { method: 'DELETE' })
        setEmployees((prev) => prev.filter((e) => e.id !== id))
      }),
    [run],
  )

  const replaceAll = useCallback(
    (incoming: Employee[]) =>
      run(async () => {
        const all = await api<Employee[]>('/employees/import', {
          method: 'POST',
          body: JSON.stringify({ mode: 'replace', employees: incoming }),
        })
        setEmployees(all)
      }),
    [run],
  )

  const mergeIn = useCallback(
    (incoming: Employee[]) =>
      run(async () => {
        const all = await api<Employee[]>('/employees/import', {
          method: 'POST',
          body: JSON.stringify({ mode: 'merge', employees: incoming }),
        })
        setEmployees(all)
      }),
    [run],
  )

  const resetToSample = useCallback(
    () =>
      run(async () => {
        const all = await api<Employee[]>('/employees/reset', { method: 'POST' })
        setEmployees(all)
      }),
    [run],
  )

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const value = useMemo<StoreValue>(
    () => ({
      employees,
      loading,
      error,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      replaceAll,
      mergeIn,
      resetToSample,
      theme,
      toggleTheme,
    }),
    [employees, loading, error, addEmployee, updateEmployee, deleteEmployee, replaceAll, mergeIn, resetToSample, theme, toggleTheme],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
