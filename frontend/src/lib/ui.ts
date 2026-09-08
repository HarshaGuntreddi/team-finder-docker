/** Small presentational helpers shared across components. */

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// Deterministic grayscale gradient for avatars, derived from the name.
const AVATAR_GRADIENTS = [
  'from-slate-700 to-slate-900',
  'from-slate-500 to-slate-700',
  'from-neutral-600 to-neutral-800',
  'from-zinc-600 to-zinc-900',
  'from-gray-500 to-gray-700',
  'from-slate-800 to-slate-950',
  'from-neutral-700 to-neutral-900',
  'from-stone-600 to-stone-800',
]

export function avatarGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
