import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent shadow-sm focus:ring-blue-500/30',
  secondary:
    'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-sm focus:ring-slate-300/40',
  soft:
    'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 focus:ring-blue-500/20',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent focus:ring-slate-300/40',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 border border-transparent shadow-sm focus:ring-rose-500/30',
};

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 p-0 rounded-lg justify-center',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    loading = false,
    disabled = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    fullWidth = false,
    className = '',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap',
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : LeftIcon ? (
        <LeftIcon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {!loading && RightIcon ? <RightIcon className="h-4 w-4 shrink-0" /> : null}
    </button>
  );
});

export default Button;
