/**
 * Utilities for turning free-text "expertise" answers into clean, normalized
 * skill tags that can be filtered and matched on.
 */

// Canonical spellings for common tools/skills so tags stay consistent even when
// people type them with different casing/spacing.
const CANONICAL: Record<string, string> = {
  'catia': 'CATIA',
  'catia v5': 'CATIA V5',
  'catia v6': 'CATIA V6',
  'ansys': 'ANSYS',
  '3d experience': '3D Experience',
  '3dexperience': '3D Experience',
  'nx': 'Siemens NX',
  'siemens nx': 'Siemens NX',
  'creo': 'Creo',
  'solidworks': 'SolidWorks',
  'autocad': 'AutoCAD',
  'abaqus': 'Abaqus',
  'hypermesh': 'HyperMesh',
  'nastran': 'Nastran',
  'matlab': 'MATLAB',
  'simulink': 'Simulink',
  'python': 'Python',
  'java': 'Java',
  'javascript': 'JavaScript',
  'c++': 'C++',
  'react': 'React',
  'sql': 'SQL',
  'power bi': 'Power BI',
  'eaction program': 'eAction Program',
  'research based project': 'Research',
  'research-based project': 'Research',
  'simulation': 'Simulation',
  'cae': 'CAE',
  'cad': 'CAD',
  'plm': 'PLM',
}

// Filler words/phrases to strip before we treat the remainder as a tag.
const NOISE = [
  'tools like',
  'tools such as',
  'such as',
  'tools',
  'like',
  'the above-mentioned',
  'above mentioned',
  'etc',
  'and simulation',
]

function cleanFragment(raw: string): string {
  let s = raw.trim().toLowerCase()
  for (const n of NOISE) {
    if (s.startsWith(n + ' ')) s = s.slice(n.length).trim()
    if (s.endsWith(' ' + n)) s = s.slice(0, -n.length).trim()
    if (s === n) s = ''
  }
  s = s.replace(/^[-•*\s]+/, '').replace(/[.,;:\s]+$/, '').trim()
  return s
}

function toTitle(s: string): string {
  return s
    .split(' ')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/** Parse a free-text expertise string into normalized, de-duplicated skill tags. */
export function parseSkills(expertiseRaw: string): string[] {
  if (!expertiseRaw) return []
  // Split on common separators: commas, semicolons, newlines, slashes and "and".
  const fragments = expertiseRaw
    .replace(/\band\b/gi, ',')
    .split(/[,;\n\/]+/)
    .map(cleanFragment)
    .filter(Boolean)

  const seen = new Set<string>()
  const out: string[] = []
  for (const frag of fragments) {
    if (frag.length < 2) continue
    const canonical = CANONICAL[frag] ?? toTitle(frag)
    const key = canonical.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      out.push(canonical)
    }
  }
  return out
}

/** Collect the unique set of skills across many employees, sorted by frequency. */
export function collectSkills(skillLists: string[][]): { skill: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const list of skillLists) {
    for (const s of list) counts.set(s, (counts.get(s) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
}
