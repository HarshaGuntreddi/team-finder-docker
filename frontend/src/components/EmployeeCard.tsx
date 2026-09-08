import { Briefcase, CircleCheck, CircleDot } from 'lucide-react'
import type { Employee } from '../types'
import { Avatar } from './Avatar'
import { SkillTag } from './SkillTag'
import { cn } from '../lib/ui'

interface Props {
  employee: Employee
  onClick?: () => void
  matchScore?: number
}

export function AvailabilityBadge({ onProject }: { onProject: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        onProject
          ? 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
          : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
      )}
    >
      {onProject ? <CircleDot className="h-3 w-3" /> : <CircleCheck className="h-3 w-3" />}
      {onProject ? 'On a project' : 'Available'}
    </span>
  )
}

export function EmployeeCard({ employee, onClick, matchScore }: Props) {
  return (
    <button
      onClick={onClick}
      className="card group flex flex-col gap-3 p-4 text-left transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
    >
      <div className="flex items-start gap-3">
        <Avatar name={employee.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{employee.name}</h3>
            {matchScore !== undefined && (
              <span className="ml-auto rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                {matchScore}% match
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">ID: {employee.employeeId || '—'}</p>
        </div>
      </div>

      <AvailabilityBadge onProject={employee.onProject} />

      {employee.onProject && employee.projectName && (
        <p className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{employee.projectName}</span>
        </p>
      )}

      {employee.skills.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {employee.skills.slice(0, 5).map((s) => (
            <SkillTag key={s} label={s} />
          ))}
          {employee.skills.length > 5 && (
            <span className="text-xs text-slate-400">+{employee.skills.length - 5}</span>
          )}
        </div>
      )}
    </button>
  )
}
