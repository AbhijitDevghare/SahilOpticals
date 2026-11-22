import { TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';

const TONE_MAP = {
  blue: {
    iconBg: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
    trend: 'bg-emerald-50 text-emerald-700',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    trend: 'bg-emerald-50 text-emerald-700',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
    trend: 'bg-emerald-50 text-emerald-700',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    trend: 'bg-amber-50 text-amber-700',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendVariant = 'positive',
  icon: Icon,
  tone = 'blue',
}) {
  const palette = TONE_MAP[tone] || TONE_MAP.blue;

  return (
    <Card hover className="p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight tabular-nums mt-2">
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${palette.iconBg}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        {subtitle && <span className="text-xs text-slate-500 truncate">{subtitle}</span>}
        {trend && (
          <span
            className={[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0',
              trendVariant === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-emerald-50 text-emerald-700',
            ].join(' ')}
          >
            {trendVariant === 'warning' ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
}
