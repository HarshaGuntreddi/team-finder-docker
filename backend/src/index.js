import express from 'express'
import cors from 'cors'
import { parseSkills } from './skills.js'
import {
  pool,
  mapRow,
  newId,
  insertEmployee,
  waitForDb,
  initDb,
  reseed,
} from './db.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

// Health check (used by docker-compose healthcheck).
app.get('/api/health', (_req, res) => res.json({ ok: true }))

// List all employees (newest first).
app.get('/api/employees', wrap(async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM employees ORDER BY seq DESC')
  res.json(rows.map(mapRow))
}))

// Create an employee.
app.post('/api/employees', wrap(async (req, res) => {
  const created = await insertEmployee(pool, { ...req.body, id: req.body.id || newId() })
  res.status(201).json(mapRow(created))
}))

// Update an employee (recomputes skills).
app.put('/api/employees/:id', wrap(async (req, res) => {
  const e = req.body
  const skills = parseSkills(e.expertiseRaw || '')
  const { rows } = await pool.query(
    `UPDATE employees SET
       row_id=$2, employee_id=$3, name=$4, email=$5, on_project=$6,
       project_name=$7, expertise_raw=$8, skills=$9::jsonb, remarks=$10, submitted_at=$11
     WHERE id=$1
     RETURNING *`,
    [
      req.params.id,
      e.rowId ?? null,
      e.employeeId ?? '',
      e.name || '(unnamed)',
      e.email ?? '',
      !!e.onProject,
      e.onProject ? e.projectName ?? null : null,
      e.expertiseRaw ?? '',
      JSON.stringify(skills),
      e.remarks ?? null,
      e.submittedAt ?? null,
    ],
  )
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  res.json(mapRow(rows[0]))
}))

// Delete an employee.
app.delete('/api/employees/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM employees WHERE id=$1', [req.params.id])
  res.status(204).end()
}))

// Bulk import: { mode: 'replace' | 'merge', employees: [...] } -> returns full list.
app.post('/api/employees/import', wrap(async (req, res) => {
  const { mode = 'merge', employees = [] } = req.body || {}
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    if (mode === 'replace') {
      await client.query('TRUNCATE employees RESTART IDENTITY')
      for (const e of employees) await insertEmployee(client, e)
    } else {
      for (const e of employees) {
        let updated = null
        if (e.employeeId) {
          const skills = parseSkills(e.expertiseRaw || '')
          const r = await client.query(
            `UPDATE employees SET
               row_id=$2, name=$3, email=$4, on_project=$5, project_name=$6,
               expertise_raw=$7, skills=$8::jsonb, remarks=$9, submitted_at=$10
             WHERE employee_id=$1
             RETURNING id`,
            [
              e.employeeId,
              e.rowId ?? null,
              e.name || '(unnamed)',
              e.email ?? '',
              !!e.onProject,
              e.onProject ? e.projectName ?? null : null,
              e.expertiseRaw ?? '',
              JSON.stringify(skills),
              e.remarks ?? null,
              e.submittedAt ?? null,
            ],
          )
          updated = r.rows[0]
        }
        if (!updated) await insertEmployee(client, e)
      }
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
  const { rows } = await pool.query('SELECT * FROM employees ORDER BY seq DESC')
  res.json(rows.map(mapRow))
}))

// Reset to the built-in sample dataset.
app.post('/api/employees/reset', wrap(async (_req, res) => {
  await reseed()
  const { rows } = await pool.query('SELECT * FROM employees ORDER BY seq DESC')
  res.json(rows.map(mapRow))
}))

const PORT = process.env.PORT || 4000

async function start() {
  await waitForDb()
  await initDb()
  app.listen(PORT, () => console.log(`[api] listening on :${PORT}`))
}

start().catch((err) => {
  console.error('Failed to start:', err)
  process.exit(1)
})
