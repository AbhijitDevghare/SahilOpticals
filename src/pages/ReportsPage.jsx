import { useCallback, useEffect, useState } from 'react';
import {
  IndianRupee,
  CheckCircle2,
  Clock3,
  ReceiptText,
  Printer,
  X,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import StatCard from '../components/dashboard/StatCard';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/ui/Table';
import { getReports } from '../services/report.service';
import { getApiErrorMessage } from '../services/api';
import { PAYMENT_MODES, PAYMENT_STATUS_VARIANTS } from '../utils/constants';
import {
  formatCurrency,
  formatDate,
  toLocalDateInputValue,
} from '../utils/formatters';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MODE_COLORS = {
  UPI: 'bg-blue-600',
  Cash: 'bg-emerald-500',
  Card: 'bg-indigo-500',
  Mixed: 'bg-amber-500',
};

const formatYearMonth = (ym) => {
  if (!ym || !ym.includes('-')) return ym || '-';
  const [year, month] = ym.split('-');
  const idx = parseInt(month, 10) - 1;
  return `${MONTH_NAMES[idx] || month} ${year}`;
};

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReports({ startDate, endDate });
      setReport(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load sales reports.'));
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const applyPreset = (preset) => {
    const today = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'month') {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(toLocalDateInputValue(firstOfMonth));
      setEndDate(toLocalDateInputValue(today));
    } else if (preset === '7d') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      setStartDate(toLocalDateInputValue(weekAgo));
      setEndDate(toLocalDateInputValue(today));
    }
  };

  const totals = report?.paidAndPendingAmounts || {
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalDiscount: 0,
    totalGST: 0,
    totalBills: 0,
  };

  const modeMap = new Map(
    (report?.paymentModeSummary || []).map((pm) => [pm.paymentMode, pm])
  );
  const paymentModesList = PAYMENT_MODES.map((mode) => {
    const row = modeMap.get(mode);
    const revenue = row?.totalRevenue || 0;
    const share =
      totals.totalRevenue > 0 ? Math.round((revenue / totals.totalRevenue) * 100) : 0;
    return {
      mode,
      count: row?.count || 0,
      revenue,
      collected: row?.paidAmount || 0,
      pending: row?.pendingAmount || 0,
      share,
    };
  });

  const statusMap = new Map(
    (report?.paymentStatusSummary || []).map((ps) => [ps.paymentStatus, ps])
  );
  const paymentStatusesList = ['Paid', 'Partial', 'Pending'].map((status) => {
    const row = statusMap.get(status);
    return {
      status,
      count: row?.count || 0,
      revenue: row?.totalRevenue || 0,
      collected: row?.paidAmount || 0,
      pending: row?.pendingAmount || 0,
    };
  });

  const dailySales = report?.dailySales || [];
  const monthlySales = report?.monthlySales || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & Payment Reports"
        subtitle="Analyze live daily sales, monthly revenue trends, GST totals, and payment mode summaries."
        actions={
          <Button
            variant="secondary"
            leftIcon={Printer}
            onClick={() => window.print()}
            className="print:hidden"
          >
            Print Report
          </Button>
        }
      />

      {/* Date Range Filter */}
      <Card className="print:hidden">
        <CardContent className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full lg:max-w-md">
            <Input
              label="From Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => applyPreset('all')}>
              All Time
            </Button>
            <Button variant="secondary" size="sm" onClick={() => applyPreset('month')}>
              This Month
            </Button>
            <Button variant="secondary" size="sm" onClick={() => applyPreset('7d')}>
              Last 7 Days
            </Button>
            {(startDate || endDate) && (
              <Button variant="ghost" size="sm" leftIcon={X} onClick={() => applyPreset('all')}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center justify-between gap-3 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={loadReports}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingState message="Generating reports..." />
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(totals.totalRevenue)}
              subtitle={`Across ${totals.totalBills} bills`}
              icon={IndianRupee}
              tone="blue"
            />
            <StatCard
              title="Paid / Collected"
              value={formatCurrency(totals.paidAmount)}
              subtitle="Total advance & full payments"
              icon={CheckCircle2}
              tone="emerald"
            />
            <StatCard
              title="Pending Amount"
              value={formatCurrency(totals.pendingAmount)}
              subtitle="Uncollected balances"
              icon={Clock3}
              tone="amber"
            />
            <StatCard
              title="GST & Discounts"
              value={formatCurrency(totals.totalGST)}
              subtitle={`Total discount given: ${formatCurrency(totals.totalDiscount)}`}
              icon={ReceiptText}
              tone="indigo"
            />
          </div>

          {/* Payment Mode & Payment Status Summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Payment Mode Summary</CardTitle>
                  <CardDescription>
                    Revenue & collections split across Cash, UPI, Card & Mixed
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentModesList.map((row) => (
                  <div key={row.mode} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{row.mode}</span>
                        <span className="text-slate-400">({row.count} bills)</span>
                      </div>
                      <div className="flex items-center gap-3 tabular-nums">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(row.revenue)}
                        </span>
                        <span className="text-slate-500 w-9 text-right">{row.share}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${MODE_COLORS[row.mode]}`}
                        style={{ width: `${row.share}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                      <span>Collected: {formatCurrency(row.collected)}</span>
                      <span>Pending: {formatCurrency(row.pending)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Payment Status Summary</CardTitle>
                  <CardDescription>Paid, Partial & Pending bill distribution</CardDescription>
                </div>
              </CardHeader>
              <Table>
                <TableHead>
                  <TableRow hover={false}>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell align="center">Bills</TableHeaderCell>
                    <TableHeaderCell align="right">Billed</TableHeaderCell>
                    <TableHeaderCell align="right">Paid</TableHeaderCell>
                    <TableHeaderCell align="right">Pending</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentStatusesList.map((row) => (
                    <TableRow key={row.status}>
                      <TableCell>
                        <Badge variant={PAYMENT_STATUS_VARIANTS[row.status]} dot>
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell align="center" className="font-semibold tabular-nums">
                        {row.count}
                      </TableCell>
                      <TableCell align="right" className="font-medium tabular-nums">
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell align="right" className="text-emerald-700 font-medium tabular-nums">
                        {formatCurrency(row.collected)}
                      </TableCell>
                      <TableCell align="right" className="text-rose-600 font-semibold tabular-nums">
                        {formatCurrency(row.pending)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Daily Sales & Monthly Sales Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Daily Sales</CardTitle>
                  <CardDescription>Day-by-day billing and collection breakdown</CardDescription>
                </div>
              </CardHeader>
              {dailySales.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No daily sales in selected range"
                  description="Create bills or widen your date filter to see daily totals."
                />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow hover={false}>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell align="center">Bills</TableHeaderCell>
                      <TableHeaderCell align="right">Revenue</TableHeaderCell>
                      <TableHeaderCell align="right">Paid</TableHeaderCell>
                      <TableHeaderCell align="right">Pending</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dailySales.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                          {formatDate(day.date)}
                        </TableCell>
                        <TableCell align="center" className="tabular-nums">
                          {day.totalBills}
                        </TableCell>
                        <TableCell align="right" className="font-semibold tabular-nums whitespace-nowrap">
                          {formatCurrency(day.totalRevenue)}
                        </TableCell>
                        <TableCell align="right" className="text-emerald-700 tabular-nums whitespace-nowrap">
                          {formatCurrency(day.paidAmount)}
                        </TableCell>
                        <TableCell
                          align="right"
                          className={[
                            'font-semibold tabular-nums whitespace-nowrap',
                            day.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-400',
                          ].join(' ')}
                        >
                          {formatCurrency(day.pendingAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Monthly Sales</CardTitle>
                  <CardDescription>Month-over-month revenue and dues overview</CardDescription>
                </div>
              </CardHeader>
              {monthlySales.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No monthly sales found"
                  description="Create bills or widen your date filter to see monthly totals."
                />
              ) : (
                <Table>
                  <TableHead>
                    <TableRow hover={false}>
                      <TableHeaderCell>Month</TableHeaderCell>
                      <TableHeaderCell align="center">Bills</TableHeaderCell>
                      <TableHeaderCell align="right">Revenue</TableHeaderCell>
                      <TableHeaderCell align="right">Paid</TableHeaderCell>
                      <TableHeaderCell align="right">Pending</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {monthlySales.map((m) => (
                      <TableRow key={m.month}>
                        <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                          {formatYearMonth(m.month)}
                        </TableCell>
                        <TableCell align="center" className="tabular-nums">
                          {m.totalBills}
                        </TableCell>
                        <TableCell align="right" className="font-semibold tabular-nums whitespace-nowrap">
                          {formatCurrency(m.totalRevenue)}
                        </TableCell>
                        <TableCell align="right" className="text-emerald-700 tabular-nums whitespace-nowrap">
                          {formatCurrency(m.paidAmount)}
                        </TableCell>
                        <TableCell
                          align="right"
                          className={[
                            'font-semibold tabular-nums whitespace-nowrap',
                            m.pendingAmount > 0 ? 'text-rose-600' : 'text-slate-400',
                          ].join(' ')}
                        >
                          {formatCurrency(m.pendingAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
