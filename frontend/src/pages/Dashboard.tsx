import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { Users, CircleCheck, Wrench, Briefcase, ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { collectSkills } from '../lib/skills'

const SKILL_COLORS = ['#1f47f5', '#3366ff', '#5990ff', '#8eb8ff', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b']

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-tight">{value}</div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  )
}

export function Dashboard() {
  const { employees } = useStore()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const total = employees.length
    const available = employees.filter((e) => !e.onProject).length
    const skillCounts = collectSkills(employees.map((e) => e.skills))
    const projects = new Set(
      employees.filter((e) => e.onProject && e.projectName).map((e) => e.projectName as string),
    )
    return {
      total,
      available,
      availablePct: total ? Math.round((available / total) * 100) : 0,
      uniqueSkills: skillCounts.length,
      activeProjects: projects.size,
      topSkills: skillCounts.slice(0, 8),
    }
  }, [employees])

  const availabilityData = [
    { name: 'Available', value: stats.available, color: '#10b981' },
    { name: 'On a project', value: stats.total - stats.available, color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-7 text-white">
          <h2 className="text-2xl font-extrabold">Welcome aboard</h2>
          <p className="mt-1 max-w-2xl text-brand-50">
            Explore who works on what across the team. Head to <span className="font-semibold">Find My Team</span> to get
            matched with people whose skills fit what you need.
          </p>
          <button className="btn mt-4 bg-white text-brand-700 hover:bg-brand-50" onClick={() => navigate('/find-team')}>
            Find my team <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="People" value={stats.total} />
        <StatCard
          icon={<CircleCheck className="h-6 w-6" />}
          label="Available now"
          value={stats.available}
          sub={`${stats.availablePct}% of team`}
        />
        <StatCard icon={<Wrench className="h-6 w-6" />} label="Unique skills" value={stats.uniqueSkills} />
        <StatCard icon={<Briefcase className="h-6 w-6" />} label="Active projects" value={stats.activeProjects} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <h3 className="mb-4 font-bold">Top skills across the team</h3>
          {stats.topSkills.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.topSkills} layout="vertical" margin={{ left: 20, right: 16 }}>
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={110}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  className="text-slate-500"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.15)' }}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {stats.topSkills.map((_, i) => (
                    <Cell key={i} fill={SKILL_COLORS[i % SKILL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-bold">Availability</h3>
          {stats.total === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={availabilityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {availabilityData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
      No data yet — add people or import a file.
    </div>
  )
}
