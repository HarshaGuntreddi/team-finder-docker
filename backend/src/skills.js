/**
 * Turn free-text "expertise" answers into clean, normalized skill tags.
 * (Ported from the frontend so the server is the single source of truth.)
 */

const CANONICAL = {
  catia: 'CATIA',
  'catia v5': 'CATIA V5',
  'catia v6': 'CATIA V6',
  ansys: 'ANSYS',
  '3d experience': '3D Experience',
  '3dexperience': '3D Experience',
  nx: 'Siemens NX',
  'siemens nx': 'Siemens NX',
  creo: 'Creo',
  solidworks: 'SolidWorks',
  autocad: 'AutoCAD',
  abaqus: 'Abaqus',
  hypermesh: 'HyperMesh',
  nastran: 'Nastran',
  matlab: 'MATLAB',
  simulink: 'Simulink',
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  'c++': 'C++',
  react: 'React',
  sql: 'SQL',
  'power bi': 'Power BI',
  'eaction program': 'eAction Program',
  'research based project': 'Research',
  'research-based project': 'Research',
  simulation: 'Simulation',
  cae: 'CAE',
  cad: 'CAD',
  plm: 'PLM',
}

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

function cleanFragment(raw) {
  let s = raw.trim().toLowerCase()
  for (const n of NOISE) {
    if (s.startsWith(n + ' ')) s = s.slice(n.length).trim()
    if (s.endsWith(' ' + n)) s = s.slice(0, -n.length).trim()
    if (s === n) s = ''
  }
  s = s.replace(/^[-•*\s]+/, '').replace(/[.,;:\s]+$/, '').trim()
  return s
}

function toTitle(s) {
  return s
    .split(' ')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

export function parseSkills(expertiseRaw) {
  if (!expertiseRaw) return []
  const fragments = expertiseRaw
    .replace(/\band\b/gi, ',')
    .split(/[,;\n\/]+/)
    .map(cleanFragment)
    .filter(Boolean)

  const seen = new Set()
  const out = []
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
