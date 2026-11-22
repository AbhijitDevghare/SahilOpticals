export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-slate-200/80 shadow-card',
        hover ? 'transition-shadow duration-150 hover:shadow-card-hover' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={[
        'px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={['text-base font-semibold text-slate-900 tracking-tight', className].join(' ')}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className = '' }) {
  return <p className={['text-xs text-slate-500 mt-0.5', className].join(' ')}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={['p-5', className].join(' ')}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={['px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 rounded-b-xl', className].join(' ')}>
      {children}
    </div>
  );
}

export default Card;
