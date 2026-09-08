import pg from 'pg'
import { randomUUID } from 'node:crypto'
import { parseSkills } from './skills.js'
import { sampleSeeds } from './sampleData.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://teamfinder:teamfinder@db:5432/teamfinder',
})

/** Map a DB row (snake_case) to the API shape (camelCase). */
export function mapRow(r) {
  return {
    id: r.id,
    rowId: r.row_id ?? undefined,
    employeeId: r.employee_id ?? '',
    name: r.name,
    email: r.email ?? '',
    onProject: r.on_project,
    projectName: r.project_name ?? undefined,
    expertiseRaw: r.expertise_raw ?? '',
    skills: r.skills ?? [],
    remarks: r.remarks ?? undefined,
    submittedAt: r.submitted_at ?? undefined,
  }
}

export function newId() {
  return 'emp-' + randomUUID().slice(0, 12)
}

/** Insert one employee (recomputes skills from expertiseRaw). Returns the created row. */
export async function insertEmployee(client, e) {
  const id = e.id || newId()
  const skills = parseSkills(e.expertiseRaw || '')
  const { rows } = await client.query(
    `INSERT INTO employees
       (id, row_id, employee_id, name, email, on_project, project_name, expertise_raw, skills, remarks, submitted_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)
     RETURNING *`,
    [
      id,
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
  return rows[0]
}

/** Wait for Postgres to accept connections (compose start-order safety net). */
export async function waitForDb(retries = 30, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1')
      return
    } catch (err) {
      console.log(`[db] not ready (attempt ${i}/${retries}): ${err.code || err.message}`)
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  throw new Error('Database not reachable after retries')
}

/** Create the schema and seed sample rows if the table is empty. */
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employees (
      seq           BIGSERIAL,
      id            TEXT PRIMARY KEY,
      row_id        TEXT,
      employee_id   TEXT,
      name          TEXT NOT NULL,
      email         TEXT,
      on_project    BOOLEAN NOT NULL DEFAULT false,
      project_name  TEXT,
      expertise_raw TEXT,
      skills        JSONB NOT NULL DEFAULT '[]'::jsonb,
      remarks       TEXT,
      submitted_at  TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM employees')
  if (rows[0].c === 0) {
    console.log('[db] seeding sample employees')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const seed of sampleSeeds) await insertEmployee(client, seed)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

/** Remove everything and reseed the sample dataset. */
export async function reseed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('TRUNCATE employees RESTART IDENTITY')
    for (const seed of sampleSeeds) await insertEmployee(client, seed)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
