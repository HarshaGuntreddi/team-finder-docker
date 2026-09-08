export interface Employee {
  /** Internal unique id (stable, generated). */
  id: string
  /** Original survey row id (from the export), if any. */
  rowId?: string
  employeeId: string
  name: string
  email: string
  /** "Are you currently occupied on a project?" */
  onProject: boolean
  /** Project name + short description (only relevant when onProject). */
  projectName?: string
  /** Free-text expertise / tools, as typed by the employee. */
  expertiseRaw: string
  /** Parsed, normalized skill tags derived from expertiseRaw. */
  skills: string[]
  remarks?: string
  /** Completion time of the survey. */
  submittedAt?: string
}

export type NewEmployee = Omit<Employee, 'id' | 'skills'> & { skills?: string[] }
