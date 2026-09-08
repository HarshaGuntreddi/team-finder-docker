import { useEffect } from 'react'
import { X, Mail, Briefcase, IdCard, Clock, Pencil, Trash2 } from 'lucide-react'
import type { Employee } from '../types'
import { Avatar } from './Avatar'
import { SkillTag } from './SkillTag'
import { AvailabilityBadge } from './EmployeeCard'

interface Props {
  employee: Employee | null
  onClose: () => void
  onEdit: (e: Employee) => void
  onDelete: (e: Employee) => void
}

export function EmployeeDrawer({ employee, onClose, onEdit, onDelete }: Props) {
  useEffect(() => {
    if (!employee) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [employee, onClose])

  if (!employee) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="font-bold">Profile</h2>
          <button className="btn-ghost !px-2 !py-2" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-4">
            <Avatar name={employee.name} size="lg" />
            <div className="min-w-0">
              <h3 className="text-xl font-bold">{employee.name}</h3>
              <div className="mt-1">
                <AvailabilityBadge onProject={employee.onProject} />
              </div>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <Row icon={<IdCard className="h-4 w-4" />} label="Employee ID" value={employee.employeeId || '—'} />
            <Row
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={
                employee.email ? (
                  <a className="font-medium text-slate-900 underline underline-offset-2 dark:text-white" href={`mailto:${employee.email}`}>
                    {employee.email}
                  </a>
                ) : (
                  '—'
                )
              }
            />
            {employee.onProject && (
              <Row icon={<Briefcase className="h-4 w-4" />} label="Current project" value={employee.projectName || '—'} />
            )}
            {employee.submittedAt && (
              <Row icon={<Clock className="h-4 w-4" />} label="Submitted" value={employee.submittedAt} />
            )}
          </dl>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-500">Expertise</h4>
            {employee.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {employee.skills.map((s) => (
                  <SkillTag key={s} label={s} size="md" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No skills recorded.</p>
            )}
            {employee.expertiseRaw && (
              <p className="mt-2 text-xs italic text-slate-400">"{employee.expertiseRaw}"</p>
            )}
          </div>

          {employee.remarks && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-500">Remarks</h4>
              <p className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">{employee.remarks}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          {employee.email && (
            <a className="btn-primary flex-1" href={`mailto:${employee.email}`}>
              <Mail className="h-4 w-4" /> Contact
            </a>
          )}
          <button className="btn-outline" onClick={() => onEdit(employee)}>
            <Pencil className="h-4 w-4" /> Edit
          </button>
          <button
            className="btn-outline"
            onClick={() => onDelete(employee)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-400">{label}</dt>
        <dd className="break-words">{value}</dd>
      </div>
    </div>
  )
}
