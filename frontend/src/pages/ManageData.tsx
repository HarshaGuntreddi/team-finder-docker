import { useRef, useState } from 'react'
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileJson,
  RotateCcw,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { parseFile, exportCsv, exportJson, exportXlsx } from '../lib/io'
import type { Employee, NewEmployee } from '../types'
import { Modal } from '../components/Modal'
import { EmployeeForm } from '../components/EmployeeForm'
import { AvailabilityBadge } from '../components/EmployeeCard'

type ImportMode = 'merge' | 'replace'
type Notice = { kind: 'ok' | 'err'; text: string } | null

export function ManageData() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, replaceAll, mergeIn, resetToSample } = useStore()

  const [mode, setMode] = useState<ImportMode>('merge')
  const [dragOver, setDragOver] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    try {
      const parsed = await parseFile(files[0])
      if (parsed.length === 0) {
        setNotice({ kind: 'err', text: 'No usable rows found. Check that the file has the survey columns.' })
        return
      }
      if (mode === 'replace') replaceAll(parsed)
      else mergeIn(parsed)
      setNotice({ kind: 'ok', text: `Imported ${parsed.length} record(s) (${mode === 'replace' ? 'replaced' : 'merged'}).` })
    } catch (err) {
      setNotice({ kind: 'err', text: 'Could not read that file. Supported: .xlsx, .xls, .csv' })
    }
  }

  function handleSubmit(data: NewEmployee) {
    if (editing) updateEmployee(editing.id, data)
    else addEmployee(data)
    setFormOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={
            'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ' +
            (notice.kind === 'ok'
              ? 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200'
              : 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900')
          }
        >
          {notice.kind === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {notice.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Import */}
        <div className="card p-5">
          <h3 className="mb-1 font-bold">Import data</h3>
          <p className="mb-4 text-sm text-slate-500">
            Drop the team survey export (Excel or CSV). Columns are matched automatically.
          </p>

          <div className="mb-3 flex gap-2">
            {(['merge', 'replace'] as ImportMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  'flex-1 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-colors ' +
                  (mode === m
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300')
                }
              >
                {m === 'merge' ? 'Merge with existing' : 'Replace all'}
              </button>
            ))}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
            onClick={() => fileRef.current?.click()}
            className={
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ' +
              (dragOver
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                : 'border-slate-300 hover:border-brand-400 dark:border-slate-700')
            }
          >
            <Upload className="h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium">Drop file here or click to browse</p>
            <p className="text-xs text-slate-400">.xlsx, .xls or .csv</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>
        </div>

        {/* Export + reset */}
        <div className="card flex flex-col p-5">
          <h3 className="mb-1 font-bold">Export data</h3>
          <p className="mb-4 text-sm text-slate-500">Download the current {employees.length} record(s) to share or back up.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button className="btn-outline" onClick={() => exportXlsx(employees)}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </button>
            <button className="btn-outline" onClick={() => exportCsv(employees)}>
              <Download className="h-4 w-4" /> CSV
            </button>
            <button className="btn-outline" onClick={() => exportJson(employees)}>
              <FileJson className="h-4 w-4" /> JSON
            </button>
          </div>

          <div className="mt-auto pt-6">
            <h4 className="mb-1 text-sm font-semibold text-slate-500">Reset</h4>
            <button
              className="btn-outline"
              onClick={() => {
                if (confirm('Reset all data back to the built-in sample set? This clears your changes.')) {
                  resetToSample()
                  setNotice({ kind: 'ok', text: 'Data reset to the built-in sample.' })
                }
              }}
            >
              <RotateCcw className="h-4 w-4" /> Reset to sample data
            </button>
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="font-bold">All records ({employees.length})</h3>
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Add person
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400 dark:bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Employee ID</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Skills</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3">
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-slate-400">{e.email || '—'}</div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{e.employeeId || '—'}</td>
                  <td className="px-5 py-3">
                    <AvailabilityBadge onProject={e.onProject} />
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-slate-500">{e.skills.slice(0, 3).join(', ') || '—'}</span>
                    {e.skills.length > 3 && <span className="text-slate-400"> +{e.skills.length - 3}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        className="btn-ghost !px-2 !py-1.5"
                        onClick={() => {
                          setEditing(e)
                          setFormOpen(true)
                        }}
                        aria-label={`Edit ${e.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="btn-ghost !px-2 !py-1.5"
                        onClick={() => {
                          if (confirm(`Remove ${e.name}?`)) deleteEmployee(e.id)
                        }}
                        aria-label={`Delete ${e.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No records. Add a person or import a file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
