import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    id,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightElement,
    containerClassName = '',
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={['w-full', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <LeftIcon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full h-10 rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400',
            'transition-colors duration-150 focus:outline-none focus:ring-4',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/15',
            LeftIcon ? 'pl-9' : 'pl-3.5',
            rightElement ? 'pr-10' : 'pr-3.5',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
