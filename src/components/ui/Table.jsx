export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={['w-full text-left border-collapse', className].join(' ')}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <thead className={['bg-slate-50/80 border-y border-slate-200/70', className].join(' ')}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return <tbody className={['divide-y divide-slate-100', className].join(' ')}>{children}</tbody>;
}

export function TableRow({ children, className = '', hover = true }) {
  return (
    <tr
      className={[
        hover ? 'hover:bg-slate-50/80 transition-colors duration-100' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, align = 'left', className = '' }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <th
      className={[
        'px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap',
        alignClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, align = 'left', className = '' }) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <td
      className={['px-3 py-3 text-sm text-slate-700 align-middle', alignClass, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </td>
  );
}

export function TableEmptyState({ colSpan, title = 'No records found', description }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </td>
    </tr>
  );
}
