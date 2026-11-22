import { useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import { formatCompactCurrency, formatCurrency } from '../../utils/formatters';

export default function SalesOverviewChart({ data = [] }) {
  const [range, setRange] = useState('6m');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const visibleData = useMemo(() => {
    if (range === '6m') return data.slice(-6);
    return data.slice(-12);
  }, [data, range]);

  const { maxVal, totalSales, totalReceived, totalPending } = useMemo(() => {
    const salesSum = visibleData.reduce((acc, item) => acc + item.totalSales, 0);
    const receivedSum = visibleData.reduce((acc, item) => acc + item.receivedAmount, 0);
    const pendingSum = visibleData.reduce((acc, item) => acc + item.pendingAmount, 0);
    const rawMax = Math.max(...visibleData.map((d) => d.totalSales), 10000);
    const niceStep = rawMax > 80000 ? 25000 : 20000;
    const roundedMax = Math.ceil(rawMax / niceStep) * niceStep;
    return {
      maxVal: roundedMax,
      totalSales: salesSum,
      totalReceived: receivedSum,
      totalPending: pendingSum,
    };
  }, [visibleData]);

  const activeItem = hoveredIndex !== null ? visibleData[hoveredIndex] : null;
  const gridLevels = [1, 0.75, 0.5, 0.25, 0];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Monthly billed revenue and payment collections</CardDescription>
        </div>

        {/* Range Switcher */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {[
            { id: '6m', label: '6 Months' },
            { id: '12m', label: '12 Months' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setRange(tab.id);
                setHoveredIndex(null);
              }}
              className={[
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150',
                range === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-5">
        {/* Compact Summary Row */}
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50/90 border border-slate-200/60 p-3.5">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Period Sales</p>
            <p className="text-sm sm:text-base font-bold text-slate-900 tabular-nums mt-0.5">
              {formatCurrency(totalSales)}
            </p>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <p className="text-[11px] font-medium text-slate-500">Collected</p>
            <p className="text-sm sm:text-base font-bold text-emerald-700 tabular-nums mt-0.5">
              {formatCurrency(totalReceived)}
            </p>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <p className="text-[11px] font-medium text-slate-500">Pending Dues</p>
            <p className="text-sm sm:text-base font-bold text-amber-700 tabular-nums mt-0.5">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </div>

        {/* Interactive Chart Canvas */}
        {visibleData.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No sales recorded yet"
            description="Create your first optical bill to view monthly revenue and collection trends."
          />
        ) : (
        <div className="relative pt-2">
          {/* Tooltip Banner (clean non-clipping readout above chart on hover) */}
          <div className="h-7 mb-2 flex items-center justify-between text-xs">
            {activeItem ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-navy-900 text-white px-3 py-1 rounded-lg shadow-sm">
                <span className="font-semibold">{activeItem.fullLabel}</span>
                <span className="text-blue-300 tabular-nums">
                  Sales: <strong>{formatCurrency(activeItem.totalSales)}</strong>
                </span>
                <span className="text-emerald-300 tabular-nums hidden sm:inline">
                  Collected: <strong>{formatCurrency(activeItem.receivedAmount)}</strong>
                </span>
                <span className="text-slate-300 tabular-nums">
                  {activeItem.totalBills} bills
                </span>
              </div>
            ) : (
              <span className="text-slate-400">
                Hover or tap any month column to inspect details
              </span>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 h-56 sm:h-64">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between pb-6 text-[11px] text-slate-400 tabular-nums text-right w-11 shrink-0 select-none">
              {gridLevels.map((ratio) => (
                <span key={ratio}>{formatCompactCurrency(maxVal * ratio)}</span>
              ))}
            </div>

            {/* Plot Area */}
            <div className="relative flex-1 flex flex-col">
              {/* Horizontal Dashed Gridlines */}
              <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                {gridLevels.map((ratio) => (
                  <div
                    key={ratio}
                    className={[
                      'w-full border-t',
                      ratio === 0 ? 'border-slate-200' : 'border-dashed border-slate-200/80',
                    ].join(' ')}
                  />
                ))}
              </div>

              {/* Columns */}
              <div className="relative z-10 flex-1 flex items-end justify-between gap-1.5 sm:gap-3 pb-6 pt-1 px-1">
                {visibleData.map((item, idx) => {
                  const salesHeightPct = Math.max(4, (item.totalSales / maxVal) * 100);
                  const receivedHeightPct = Math.max(3, (item.receivedAmount / maxVal) * 100);
                  const isActive = hoveredIndex === idx;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onFocus={() => setHoveredIndex(idx)}
                      onBlur={() => setHoveredIndex(null)}
                      className="group relative flex-1 h-full flex flex-col items-center justify-end focus:outline-none"
                      aria-label={`${item.fullLabel}: Sales ${formatCurrency(item.totalSales)}`}
                    >
                      <div className="w-full max-w-[42px] h-full flex items-end justify-center gap-1">
                        {/* Total Sales Bar */}
                        <div
                          style={{ height: `${salesHeightPct}%` }}
                          className={[
                            'flex-1 rounded-t-md transition-colors duration-150',
                            isActive ? 'bg-blue-700' : 'bg-blue-600 group-hover:bg-blue-700',
                          ].join(' ')}
                        />
                        {/* Collected Amount Bar */}
                        <div
                          style={{ height: `${receivedHeightPct}%` }}
                          className={[
                            'flex-1 rounded-t-md transition-colors duration-150 hidden sm:block',
                            isActive
                              ? 'bg-sky-400'
                              : 'bg-blue-200 group-hover:bg-sky-300',
                          ].join(' ')}
                        />
                      </div>

                      {/* X-Axis Label */}
                      <span
                        className={[
                          'absolute -bottom-6 text-[11px] font-medium truncate max-w-full transition-colors',
                          isActive ? 'text-blue-700 font-semibold' : 'text-slate-500',
                        ].join(' ')}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
              Total Sales
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-200" />
              Amount Collected
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Currency: INR (₹)</span>
        </div>
      </CardContent>
    </Card>
  );
}
