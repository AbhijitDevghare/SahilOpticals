import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Printer,
  Download,
  Trash2,
  X,
  ReceiptText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/ui/Table';
import { deleteBill, downloadBillPdf, getBills } from '../services/bill.service';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { PAYMENT_MODES, PAYMENT_STATUS_VARIANTS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function BillsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const outletContext = useOutletContext() || {};

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [billToDelete, setBillToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const effectiveSearch = (search || outletContext.globalSearch || '').trim();

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBills({
        search: effectiveSearch,
        startDate,
        endDate,
        paymentStatus: statusFilter,
        paymentMode: modeFilter,
      });
      setBills(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load bills.'));
    } finally {
      setLoading(false);
    }
  }, [effectiveSearch, startDate, endDate, statusFilter, modeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchBills]);

  const hasActiveFilters = Boolean(
    search || statusFilter !== 'All' || modeFilter !== 'All' || startDate || endDate
  );

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setModeFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const handleDownloadPdf = async (bill) => {
    try {
      await downloadBillPdf(bill._id, bill.billNumber);
      toast.success(`Downloaded PDF for ${bill.billNumber}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download invoice PDF.'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!billToDelete) return;
    setDeleting(true);
    try {
      await deleteBill(billToDelete._id);
      toast.success(`Deleted bill ${billToDelete.billNumber}`);
      setBillToDelete(null);
      fetchBills();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete bill.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Bills"
        subtitle="Search by bill number or customer, filter by date, view invoices, or delete bills."
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/billing')}>
            New Bill
          </Button>
        }
      />

      {/* Filters Card */}
      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
            <div className="lg:col-span-4">
              <Input
                label="Search Bill No. / Customer"
                placeholder="e.g. SO-2026-0001, name, mobile..."
                leftIcon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <Input
                label="From Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <Input
                label="To Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={['All', 'Paid', 'Partial', 'Pending']}
              />
            </div>

            <div className="lg:col-span-2">
              <Select
                label="Payment Mode"
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                options={['All', ...PAYMENT_MODES]}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 tabular-nums">
              Showing <strong className="text-slate-900">{bills.length}</strong>{' '}
              {bills.length === 1 ? 'bill' : 'bills'}
            </span>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" leftIcon={X} onClick={clearFilters}>
                Clear Filters
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
          <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={fetchBills}>
            Retry
          </Button>
        </div>
      )}

      {/* Bills Table Card */}
      <Card>
        {loading ? (
          <LoadingState message="Loading bills..." />
        ) : bills.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No bills found"
            description="Try adjusting your date/search filters or create a new optical bill."
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Reset Filters
                </Button>
              ) : (
                <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/billing')}>
                  Create First Bill
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
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
                  {bills.map((bill) => {
                    const summaryText = (bill.items || []).map((i) => i.name).join(' + ');
                    return (
                      <TableRow key={bill._id}>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => navigate(`/bills/${bill._id}`)}
                            className="font-semibold text-blue-700 hover:underline tabular-nums whitespace-nowrap"
                          >
                            {bill.billNumber}
                          </button>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(bill.billDate)}
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() =>
                              bill.customer?._id && navigate(`/customers/${bill.customer._id}`)
                            }
                            className="text-left group"
                          >
                            <p className="font-medium text-slate-900 group-hover:text-blue-700 leading-tight">
                              {bill.customer?.name || '-'}
                            </p>
                            <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                              {bill.customer?.mobile || '-'}
                            </p>
                          </button>
                        </TableCell>
                        <TableCell>
                          <p
                            className="text-xs text-slate-600 max-w-[220px] truncate"
                            title={summaryText}
                          >
                            {summaryText}
                          </p>
                        </TableCell>
                        <TableCell
                          align="right"
                          className="font-semibold text-slate-900 tabular-nums whitespace-nowrap"
                        >
                          {formatCurrency(bill.grandTotal)}
                        </TableCell>
                        <TableCell
                          align="right"
                          className="text-slate-600 tabular-nums whitespace-nowrap"
                        >
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
                              onClick={() => navigate(`/bills/${bill._id}`)}
                              title="View Invoice"
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/bills/${bill._id}?print=true`)}
                              title="Print Invoice"
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                              <Printer className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(bill)}
                              title="Download PDF"
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setBillToDelete(bill)}
                              title="Delete Bill"
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Stacked Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {bills.map((bill) => (
                <div key={bill._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/bills/${bill._id}`)}
                        className="text-sm font-semibold text-blue-700 tabular-nums"
                      >
                        {bill.billNumber}
                      </button>
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

                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs tabular-nums">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(bill.grandTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Advance</span>
                      <span className="font-medium text-slate-700">
                        {formatCurrency(bill.advance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Balance</span>
                      <span
                        className={[
                          'font-semibold',
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
                        onClick={() => navigate(`/bills/${bill._id}`)}
                      >
                        Invoice
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Trash2}
                        onClick={() => setBillToDelete(bill)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        isOpen={Boolean(billToDelete)}
        onClose={() => setBillToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Bill"
        message={
          billToDelete
            ? `Are you sure you want to permanently delete bill ${billToDelete.billNumber} for ${billToDelete.customer?.name}?`
            : ''
        }
        confirmLabel="Delete Bill"
      />
    </div>
  );
}
