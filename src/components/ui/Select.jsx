import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    id,
    error,
    helperText,
    options = [],
    placeholder,
    containerClassName = '',
    className = '',
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={['w-full', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full h-10 appearance-none rounded-lg border bg-white pl-3.5 pr-9 text-sm text-slate-900',
            'transition-colors duration-150 focus:outline-none focus:ring-4',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/15',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children
            ? children
            : options.map((opt) => {
                const value = typeof opt === 'string' ? opt : opt.value;
                const text = typeof opt === 'string' ? opt : opt.label;
                return (
                  <option key={value} value={value}>
                    {text}
                  </option>
                );
              })}
        </select>
        <ChevronDown className="h-4 w-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
