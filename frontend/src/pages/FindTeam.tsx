import { useMemo, useState } from 'react'
import { Compass, ArrowRight, ArrowLeft, Sparkles, RotateCcw, Search } from 'lucide-react'
import { useStore } from '../lib/store'
import { collectSkills } from '../lib/skills'
import type { Employee } from '../types'
import { SkillTag } from '../components/SkillTag'
import { EmployeeCard } from '../components/EmployeeCard'
import { EmployeeDrawer } from '../components/EmployeeDrawer'

type AvailPref = 'any' | 'available'

interface Match {
  employee: Employee
  score: number
  matched: string[]
}

export function FindTeam() {
  const { employees } = useStore()
  const [step, setStep] = useState(0)
  const [wanted, setWanted] = useState<string[]>([])
  const [availPref, setAvailPref] = useState<AvailPref>('any')
  const [skillQuery, setSkillQuery] = useState('')
  const [selected, setSelected] = useState<Employee | null>(null)

  const allSkills = useMemo(() => collectSkills(employees.map((e) => e.skills)), [employees])
  const visibleSkills = useMemo(() => {
    const q = skillQuery.trim().toLowerCase()
    return q ? allSkills.filter((s) => s.skill.toLowerCase().includes(q)) : allSkills
  }, [allSkills, skillQuery])

  const matches = useMemo<Match[]>(() => {
    if (wanted.length === 0) return []
    const results = employees
      .map((e) => {
        const matched = wanted.filter((w) => e.skills.includes(w))
        const skillScore = matched.length / wanted.length
        const availMatch = !e.onProject
        // Skill fit is the main driver; availability adds a bonus.
        let score = skillScore * 85 + (availMatch ? 15 : 0)
        if (availPref === 'available' && e.onProject) score -= 40
        return { employee: e, score: Math.max(0, Math.round(score)), matched }
      })
      .filter((m) => m.matched.length > 0)
      .sort((a, b) => b.score - a.score || b.matched.length - a.matched.length)
    return results
  }, [employees, wanted, availPref])

  function toggle(skill: string) {
    setWanted((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  function restart() {
    setStep(0)
    setWanted([])
    setAvailPref('any')
    setSkillQuery('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Find My Team</h2>
          <p className="text-sm text-slate-500">Answer a couple of quick questions and we'll match you to the right people.</p>
        </div>
      </div>

      <Stepper step={step} />

      {/* Step 1: skills */}
      {step === 0 && (
        <div className="card space-y-4 p-5">
          <div>
            <h3 className="font-bold">What skills or tools do you need help with?</h3>
            <p className="text-sm text-slate-500">Pick everything that's relevant — we'll rank people by how well they fit.</p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search skills…"
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleSkills.map(({ skill, count }) => (
              <SkillTag
                key={skill}
                label={`${skill} (${count})`}
                active={wanted.includes(skill)}
                onClick={() => toggle(skill)}
                size="md"
              />
            ))}
            {visibleSkills.length === 0 && <p className="text-sm text-slate-400">No matching skills.</p>}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-slate-500">{wanted.length} selected</span>
            <button className="btn-primary" disabled={wanted.length === 0} onClick={() => setStep(1)}>
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: availability */}
      {step === 1 && (
        <div className="card space-y-4 p-5">
          <div>
            <h3 className="font-bold">Any availability preference?</h3>
            <p className="text-sm text-slate-500">We'll still show everyone, just ranked to match your preference.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PrefCard
              title="Anyone"
              desc="Show all matching people regardless of current workload."
              active={availPref === 'any'}
              onClick={() => setAvailPref('any')}
            />
            <PrefCard
              title="Prefer available"
              desc="Prioritise people who aren't currently on a project."
              active={availPref === 'available'}
              onClick={() => setAvailPref('available')}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button className="btn-outline" onClick={() => setStep(0)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button className="btn-primary" onClick={() => setStep(2)}>
              See matches <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: results */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h3 className="font-bold">
                {matches.length} match{matches.length === 1 ? '' : 'es'} for you
              </h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {wanted.map((w) => (
                  <SkillTag key={w} label={w} />
                ))}
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="btn-outline" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4" /> Edit
              </button>
              <button className="btn-ghost" onClick={restart}>
                <RotateCcw className="h-4 w-4" /> Restart
              </button>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="font-semibold">No one matches those skills yet</p>
              <p className="text-sm text-slate-500">Try selecting different skills, or add people in the directory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((m) => (
                <EmployeeCard
                  key={m.employee.id}
                  employee={m.employee}
                  matchScore={m.score}
                  onClick={() => setSelected(m.employee)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <EmployeeDrawer
        employee={selected}
        onClose={() => setSelected(null)}
        onEdit={() => setSelected(null)}
        onDelete={() => setSelected(null)}
      />
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  const labels = ['Skills', 'Preference', 'Matches']
  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ' +
              (i <= step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-800')
            }
          >
            {i + 1}
          </div>
          <span className={'text-sm font-medium ' + (i <= step ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400')}>
            {label}
          </span>
          {i < labels.length - 1 && <div className="h-px w-6 bg-slate-300 dark:bg-slate-700 sm:w-10" />}
        </div>
      ))}
    </div>
  )
}

function PrefCard({
  title,
  desc,
  active,
  onClick,
}: {
  title: string
  desc: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-2xl border-2 p-4 text-left transition-colors ' +
        (active
          ? 'border-brand-600 bg-brand-50 dark:bg-brand-500/10'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700')
      }
    >
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{desc}</div>
    </button>
  )
}
