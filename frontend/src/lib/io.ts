import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import type { Employee } from '../types'
import { parseSkills } from './skills'

/** Normalize a header cell for fuzzy matching. */
function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Find the first row value whose header matches any of the candidate keywords. */
function pick(row: Record<string, unknown>, keys: string[], candidates: string[]): string {
  for (const key of keys) {
    const nk = norm(key)
    if (candidates.some((c) => nk.includes(c))) {
      const v = row[key]
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
    }
  }
  return ''
}

function toBool(v: string): boolean {
  const s = v.trim().toLowerCase()
  return s === 'yes' || s === 'y' || s === 'true' || s === '1'
}

function genId(seed: string): string {
  return 'imp-' + norm(seed).replace(/\s+/g, '') + '-' + Math.random().toString(36).slice(2, 7)
}

/** Convert an arbitrary parsed row object into an Employee. */
export function rowToEmployee(row: Record<string, unknown>): Employee | null {
  const keys = Object.keys(row)
  const rowId = pick(row, keys, ['id']) // matches "Id"
  const email = pick(row, keys, ['email', 'mail'])
  const employeeId = pick(row, keys, ['employee id', 'emp id', 'employeeid'])
  const employeeName = pick(row, keys, ['employee name'])
  const name = employeeName || pick(row, keys, ['name'])
  const onProjectRaw = pick(row, keys, ['occupied', 'currently on', 'on a project', 'project?'])
  const projectName = pick(row, keys, ['description of the project', 'project name', 'short description'])
  const expertiseRaw = pick(row, keys, ['expertise', 'skills', 'tools'])
  const remarks = pick(row, keys, ['remark', 'comment', 'note'])
  const submittedAt = pick(row, keys, ['completion time', 'completed', 'submitted'])

  // Skip fully-empty rows.
  if (!name && !email && !employeeId && !expertiseRaw) return null

  return {
    id: genId(employeeId || email || name || rowId || String(Math.random())),
    rowId: rowId || undefined,
    employeeId,
    name: name || '(unnamed)',
    email,
    onProject: toBool(onProjectRaw),
    projectName: projectName || undefined,
    expertiseRaw,
    skills: parseSkills(expertiseRaw),
    remarks: remarks || undefined,
    submittedAt: submittedAt || undefined,
  }
}

/** Parse a File (.xlsx/.xls/.csv) into Employee records. */
export async function parseFile(file: File): Promise<Employee[]> {
  const name = file.name.toLowerCase()
  let rows: Record<string, unknown>[] = []

  if (name.endsWith('.csv') || file.type === 'text/csv') {
    const text = await file.text()
    const result = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
    })
    rows = result.data
  } else {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  }

  return rows.map(rowToEmployee).filter((e): e is Employee => e !== null)
}

const EXPORT_HEADERS = [
  'Id',
  'Completion time',
  'Email',
  'Employee ID',
  'Employee Name',
  'Are you currently occupied on a project?',
  'Name and Short Description of the project',
  'Expertise',
  'Remarks',
]

function toRow(e: Employee): Record<string, string> {
  return {
    Id: e.rowId ?? '',
    'Completion time': e.submittedAt ?? '',
    Email: e.email,
    'Employee ID': e.employeeId,
    'Employee Name': e.name,
    'Are you currently occupied on a project?': e.onProject ? 'Yes' : 'No',
    'Name and Short Description of the project': e.projectName ?? '',
    Expertise: e.expertiseRaw,
    Remarks: e.remarks ?? '',
  }
}

function download(filename: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportCsv(employees: Employee[]) {
  const csv = Papa.unparse({ fields: EXPORT_HEADERS, data: employees.map((e) => Object.values(toRow(e))) })
  download('team-data.csv', csv, 'text/csv;charset=utf-8')
}

export function exportJson(employees: Employee[]) {
  download('team-data.json', JSON.stringify(employees, null, 2), 'application/json')
}

export function exportXlsx(employees: Employee[]) {
  const ws = XLSX.utils.json_to_sheet(employees.map(toRow), { header: EXPORT_HEADERS })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Team')
  XLSX.writeFile(wb, 'team-data.xlsx')
}
