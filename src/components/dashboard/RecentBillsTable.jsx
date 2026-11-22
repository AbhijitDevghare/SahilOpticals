import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Printer, Download, Search, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmptyState,
} from '../ui/Table';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PAYMENT_STATUS_VARIANTS } from '../../utils/constants';

const STATUS_TABS = ['All', 'Paid', 'Partial', 'Pending'];

export default function RecentBillsTable({ bills = [], externalSearch = '', onBillAction }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  const effectiveSearch = (localSearch || externalSearch).trim().toLowerCase();

  const normalizedBills = useMemo(() => {
    return bills.map((bill) => ({
      ...bill,
      itemsSummary:
        bill.itemsSummary || (bill.items || []).map((item) => item.name).join(' + '),
    }));
  }, [bills]);

  const filteredBills = useMemo(() => {
    return normalizedBills.filter((bill) => {
      const matchesStatus = statusFilter === 'All' || bill.paymentStatus === statusFilter;
      if (!matchesStatus) return false;
      if (!effectiveSearch) return true;

      return (
        bill.billNumber.toLowerCase().includes(effectiveSearch) ||
        bill.customer?.name?.toLowerCase().includes(effectiveSearch) ||
        bill.customer?.mobile?.toLowerCase().includes(effectiveSearch) ||
        bill.itemsSummary?.toLowerCase().includes(effectiveSearch) ||
        bill.paymentMode?.toLowerCase().includes(effectiveSearch)
      );
    });
  }, [normalizedBills, statusFilter, effectiveSearch]);

  return (
    <Card>
      <CardHeader className="gap-4">
        <div>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>
            Latest optical invoices generated at Sahil Optical
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Status Filter Pills */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {STATUS_TABS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={[
                  'px-2.5 py-1 text-xs font-medium rounded-md transition-colors duration-150',
                  statusFilter === status
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Inline Search */}
          <div className="relative flex-1 sm:flex-none sm:w-52">
            <Search className="h-3.5 w-3.5 text-slate-400 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter bills..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            rightIcon={ArrowRight}
            onClick={() => navigate('/bills')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View All
          </Button>
        </div>
      </CardHeader>

      {/* Desktop & Tablet Table View */}
      <div className="hidden sm:block">
        <Table>
          <TableHead>
            <TableRow hover={false}>
              <TableHeaderCell>Bill No</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Items</TableHeaderCell>
              <TableHeaderCell align="right">Total</TableHeaderCell>
              <TableHeaderCell align="right">Advance</TableHeaderCell>
              <TableHeaderCell align="right">Balance</TableHeaderCell>
              <TableHeaderCell>Mode</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.length === 0 ? (
              <TableEmptyState
                colSpan={10}
                title="No matching bills found"
                description="Try clearing the search query or switching the payment status filter."
              />
            ) : (
              filteredBills.map((bill) => (
                <TableRow key={bill._id}>
                  <TableCell>
                    <span className="font-semibold text-blue-700 tabular-nums whitespace-nowrap">
                      {bill.billNumber}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 whitespace-nowrap text-xs">
                    {formatDate(bill.billDate)}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[140px]">
                      <p className="font-medium text-slate-900 leading-tight">
                        {bill.customer?.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {bill.customer?.mobile}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p
                      className="text-xs text-slate-600 max-w-[230px] truncate"
                      title={bill.itemsSummary}
                    >
                      {bill.itemsSummary}
                    </p>
                  </TableCell>
                  <TableCell align="right" className="font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatCurrency(bill.grandTotal)}
                  </TableCell>
                  <TableCell align="right" className="text-slate-600 tabular-nums whitespace-nowrap">
                    {formatCurrency(bill.advance)}
                  </TableCell>
                  <TableCell
                    align="right"
                    className={[
                      'font-semibold tabular-nums whitespace-nowrap',
                      bill.balance > 0 ? 'text-rose-600' : 'text-emerald-600',
                    ].join(' ')}
                  >
                    {formatCurrency(bill.balance)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral">{bill.paymentMode}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={PAYMENT_STATUS_VARIANTS[bill.paymentStatus] || 'neutral'}
                      dot
                    >
                      {bill.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onBillAction?.('view', bill)}
                        title="View Invoice"
                        aria-label={`View invoice ${bill.billNumber}`}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onBillAction?.('print', bill)}
                        title="Print Invoice"
                        aria-label={`Print invoice ${bill.billNumber}`}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onBillAction?.('pdf', bill)}
                        title="Download PDF"
                        aria-label={`Download PDF for ${bill.billNumber}`}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked Card List */}
      <div className="sm:hidden divide-y divide-slate-100">
        {filteredBills.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No matching bills found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try clearing your filter or search query.
            </p>
          </div>
        ) : (
          filteredBills.map((bill) => (
            <div key={bill._id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-sm font-semibold text-blue-700 tabular-nums">
                    {bill.billNumber}
                  </span>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">
                    {bill.customer?.name}
                  </p>
                  <p className="text-xs text-slate-500 tabular-nums">
                    {bill.customer?.mobile} · {formatDate(bill.billDate)}
                  </p>
                </div>
                <Badge
                  variant={PAYMENT_STATUS_VARIANTS[bill.paymentStatus] || 'neutral'}
                  dot
                >
                  {bill.paymentStatus}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 line-clamp-1">{bill.itemsSummary}</p>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(bill.grandTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Advance</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    {formatCurrency(bill.advance)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Balance</span>
                  <span
                    className={[
                      'font-semibold tabular-nums',
                      bill.balance > 0 ? 'text-rose-600' : 'text-emerald-600',
                    ].join(' ')}
                  >
                    {formatCurrency(bill.balance)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Badge variant="neutral">{bill.paymentMode}</Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={Eye}
                    onClick={() => onBillAction?.('view', bill)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={Printer}
                    onClick={() => onBillAction?.('print', bill)}
                  >
                    Print
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
