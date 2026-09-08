import { useState } from 'react'
import type { Employee, NewEmployee } from '../types'
import { parseSkills } from '../lib/skills'
import { SkillTag } from './SkillTag'

interface Props {
  initial?: Employee
  onSubmit: (data: NewEmployee) => void
  onCancel: () => void
}

export function EmployeeForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [employeeId, setEmployeeId] = useState(initial?.employeeId ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [onProject, setOnProject] = useState(initial?.onProject ?? false)
  const [projectName, setProjectName] = useState(initial?.projectName ?? '')
  const [expertiseRaw, setExpertiseRaw] = useState(initial?.expertiseRaw ?? '')
  const [remarks, setRemarks] = useState(initial?.remarks ?? '')
  const [error, setError] = useState('')

  const previewSkills = parseSkills(expertiseRaw)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a name.')
      return
    }
    onSubmit({
      rowId: initial?.rowId,
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim(),
      onProject,
      projectName: onProject ? projectName.trim() : undefined,
      expertiseRaw: expertiseRaw.trim(),
      remarks: remarks.trim() || undefined,
      submittedAt: initial?.submittedAt ?? new Date().toLocaleString(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Employee Name *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" />
        </div>
        <div>
          <label className="label">Employee ID</label>
          <input className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. 93345101" />
        </div>
      </div>

      <div>
        <label className="label">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <input
          id="onProject"
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          checked={onProject}
          onChange={(e) => setOnProject(e.target.checked)}
        />
        <label htmlFor="onProject" className="text-sm font-medium">
          Currently occupied on a project
        </label>
      </div>

      {onProject && (
        <div>
          <label className="label">Project name & short description</label>
          <textarea
            className="input min-h-[70px]"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. eAction Program — research-based project"
          />
        </div>
      )}

      <div>
        <label className="label">Expertise / tools</label>
        <textarea
          className="input min-h-[70px]"
          value={expertiseRaw}
          onChange={(e) => setExpertiseRaw(e.target.value)}
          placeholder="e.g. CATIA V5, 3D Experience and simulation tools like ANSYS"
        />
        {previewSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-400">Detected skills:</span>
            {previewSkills.map((s) => (
              <SkillTag key={s} label={s} />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">Remarks</label>
        <textarea
          className="input min-h-[60px]"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Anything else useful for matching…"
        />
      </div>

      {error && <p className="text-sm font-semibold text-slate-900 dark:text-white">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? 'Save changes' : 'Add person'}
        </button>
      </div>
    </form>
  )
}
