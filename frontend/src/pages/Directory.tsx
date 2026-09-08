import { useMemo, useState } from 'react'
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react'
import { useStore } from '../lib/store'
import { collectSkills } from '../lib/skills'
import type { Employee, NewEmployee } from '../types'
import { EmployeeCard } from '../components/EmployeeCard'
import { EmployeeDrawer } from '../components/EmployeeDrawer'
import { SkillTag } from '../components/SkillTag'
import { Modal } from '../components/Modal'
import { EmployeeForm } from '../components/EmployeeForm'

type AvailFilter = 'all' | 'available' | 'busy'

export function Directory() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useStore()

  const [query, setQuery] = useState('')
  const [avail, setAvail] = useState<AvailFilter>('all')
  const [activeSkills, setActiveSkills] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const [selected, setSelected] = useState<Employee | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const allSkills = useMemo(() => collectSkills(employees.map((e) => e.skills)), [employees])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return employees.filter((e) => {
      if (avail === 'available' && e.onProject) return false
      if (avail === 'busy' && !e.onProject) return false
      if (activeSkills.length && !activeSkills.every((s) => e.skills.includes(s))) return false
      if (q) {
        const hay = [e.name, e.employeeId, e.email, e.projectName, e.expertiseRaw, e.remarks]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [employees, query, avail, activeSkills])

  function toggleSkill(skill: string) {
    setActiveSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  function handleSubmit(data: NewEmployee) {
    if (editing) updateEmployee(editing.id, data)
    else addEmployee(data)
    setFormOpen(false)
    setEditing(null)
  }

  function handleDelete(e: Employee) {
    if (confirm(`Remove ${e.name} from the directory?`)) {
      deleteEmployee(e.id)
      setSelected(null)
    }
  }

  const hasFilters = avail !== 'all' || activeSkills.length > 0 || query.trim() !== ''

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by name, skill, project, ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn-outline"
            onClick={() => setShowFilters((s) => !s)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {activeSkills.length > 0 && (
              <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeSkills.length}</span>
            )}
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Availability segmented control */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'available', 'busy'] as AvailFilter[]).map((v) => (
          <button
            key={v}
            onClick={() => setAvail(v)}
            className={
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ' +
              (avail === v
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300')
            }
          >
            {v === 'all' ? 'Everyone' : v === 'available' ? 'Available' : 'On a project'}
          </button>
        ))}
        {hasFilters && (
          <button
            className="ml-auto inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            onClick={() => {
              setQuery('')
              setAvail('all')
              setActiveSkills([])
            }}
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {/* Skill filter chips */}
      {showFilters && (
        <div className="card animate-fade-in p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-500">Filter by skill</h4>
          <div className="flex flex-wrap gap-2">
            {allSkills.map(({ skill, count }) => (
              <SkillTag
                key={skill}
                label={`${skill} (${count})`}
                active={activeSkills.includes(skill)}
                onClick={() => toggleSkill(skill)}
                size="md"
              />
            ))}
            {allSkills.length === 0 && <p className="text-sm text-slate-400">No skills recorded yet.</p>}
          </div>
        </div>
      )}

      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span> of {employees.length} people
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="font-semibold">No matches</p>
          <p className="text-sm text-slate-500">Try clearing filters or adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <EmployeeCard key={e.id} employee={e} onClick={() => setSelected(e)} />
          ))}
        </div>
      )}

      <EmployeeDrawer
        employee={selected}
        onClose={() => setSelected(null)}
        onEdit={(e) => {
          setEditing(e)
          setSelected(null)
          setFormOpen(true)
        }}
        onDelete={handleDelete}
      />

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Edit person' : 'Add a person'}
        maxWidth="max-w-2xl"
      >
        <EmployeeForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      </Modal>
    </div>
  )
}
