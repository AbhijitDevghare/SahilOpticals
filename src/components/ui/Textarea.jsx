import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    error,
    helperText,
    rows = 3,
    containerClassName = '',
    className = '',
    ...props
  },
  ref
) {
  const fieldId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={['w-full', containerClassName].filter(Boolean).join(' ')}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-xs font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={[
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
          'transition-colors duration-150 focus:outline-none focus:ring-4 resize-y',
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/15',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
