import { avatarGradient, cn, initials } from '../lib/ui'

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-lg',
  }
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-sm',
        avatarGradient(name),
        sizes[size],
      )}
      aria-hidden
    >
      {initials(name)}
    </div>
  )
}
