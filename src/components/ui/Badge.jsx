const VARIANT_STYLES = {
  success: {
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  warning: {
    pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
  },
  danger: {
    pill: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
  },
  info: {
    pill: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
  },
  neutral: {
    pill: 'bg-slate-100 text-slate-700 border-slate-200/80',
    dot: 'bg-slate-500',
  },
};

export default function Badge({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
}) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.neutral;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        styles.pill,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  );
}
