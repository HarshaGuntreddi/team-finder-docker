import { cn } from '../lib/ui'

interface Props {
  label: string
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function SkillTag({ label, active, onClick, size = 'sm' }: Props) {
  const base =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  const clickable = onClick
    ? 'cursor-pointer transition-colors'
    : ''
  const tone = active
    ? 'bg-brand-600 text-white border-brand-600'
    : 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-200 dark:border-brand-500/20 dark:hover:bg-brand-500/20'

  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('inline-flex items-center rounded-full border font-medium', base, tone, clickable)}
    >
      {label}
    </Comp>
  )
}
