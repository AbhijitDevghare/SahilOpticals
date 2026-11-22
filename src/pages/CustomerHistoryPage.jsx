import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Phone,
  MapPin,
  ReceiptText,
  IndianRupee,
  CheckCircle2,
  Clock3,
  Eye,
  Printer,
  Download,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
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
import { getCustomerHistory } from '../services/customer.service';
import { downloadBillPdf } from '../services/bill.service';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { PAYMENT_STATUS_VARIANTS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function CustomerHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCustomerHistory(id);
      setHistoryData(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load customer billing history.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDownloadPdf = async (bill) => {
    try {
      await downloadBillPdf(bill._id, bill.billNumber);
      toast.success(`Downloaded PDF for ${bill.billNumber}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download invoice PDF.'));
    }
  };

  if (loading) {
    return <LoadingState message="Loading customer history..." />;
  }

  if (error) {
    return (
      <Card className="p-6 max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm font-semibold text-slate-900">Unable to load customer</p>
          <p className="text-xs text-slate-500">{error}</p>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="secondary" leftIcon={ArrowLeft} onClick={() => navigate('/customers')}>
              Back to Customers
            </Button>
            <Button variant="primary" leftIcon={RefreshCw} onClick={loadHistory}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!historyData?.customer) {
    return (
      <Card>
        <EmptyState
          icon={User}
          title="Customer not found"
          description="The requested customer record does not exist."
          action={
            <Button variant="primary" leftIcon={ArrowLeft} onClick={() => navigate('/customers')}>
              Back to Customers
            </Button>
          }
        />
      </Card>
    );
  }

  const { customer, latestPrescription, summary, bills = [] } = historyData;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        subtitle="Complete customer profile, latest eye prescription, and billing history."
        actions={
          <>
            <Button variant="secondary" leftIcon={ArrowLeft} onClick={() => navigate('/customers')}>
              All Customers
            </Button>
            <Button
              variant="primary"
              leftIcon={Plus}
              onClick={() => navigate('/billing', { state: { customer } })}
            >
              New Bill for Customer
            </Button>
          </>
        }
      />

      {/* Profile Info Bar */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-600" />
            <span className="font-semibold tabular-nums">{customer.mobile}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{customer.address || 'No address recorded'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs (from backend summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Bills"
          value={String(summary?.totalBills ?? 0)}
          subtitle="Invoices generated"
          icon={ReceiptText}
          tone="blue"
        />
        <StatCard
          title="Total Billed"
          value={formatCurrency(summary?.totalSpent ?? 0)}
          subtitle="Lifetime optical purchases"
          icon={IndianRupee}
          tone="indigo"
        />
        <StatCard
          title="Total Paid"
          value={formatCurrency(summary?.totalPaid ?? 0)}
          subtitle="Collected amount"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          title="Pending Balance"
          value={formatCurrency(summary?.totalBalance ?? 0)}
          subtitle={(summary?.totalBalance || 0) > 0 ? 'Outstanding dues' : 'All bills settled'}
          icon={Clock3}
          tone="amber"
        />
      </div>

      {/* Latest Eye Prescription Card */}
      {latestPrescription && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Latest Recorded Eye Prescription</CardTitle>
              <CardDescription>
                From Bill {latestPrescription.fromBillNumber} on{' '}
                {formatDate(latestPrescription.fromBillDate)}
              </CardDescription>
            </div>
            {latestPrescription.lensType && (
              <Badge variant="info">{latestPrescription.lensType}</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-2.5 text-left font-semibold">Eye</th>
                    <th className="px-4 py-2.5 text-center font-semibold">SPH</th>
                    <th className="px-4 py-2.5 text-center font-semibold">CYL</th>
                    <th className="px-4 py-2.5 text-center font-semibold">Axis</th>
                    <th className="px-4 py-2.5 text-center font-semibold">ADD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">Right Eye (OD)</td>
                    <td className="px-4 py-2.5 text-center">{latestPrescription.rightEye?.sph || '-'}</td>
                    <td className="px-4 py-2.5 text-center">{latestPrescription.rightEye?.cyl || '-'}</td>
                    <td className="px-4 py-2.5 text-center">
                      {latestPrescription.rightEye?.axis ? `${latestPrescription.rightEye.axis}°` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-center">{latestPrescription.rightEye?.add || '-'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">Left Eye (OS)</td>
                    <td className="px-4 py-2.5 text-center">{latestPrescription.leftEye?.sph || '-'}</td>
                    <td className="px-4 py-2.5 text-center">{latestPrescription.leftEye?.cyl || '-'}</td>
                    <td className="px-4 py-2.5 text-center">
                      {latestPrescription.leftEye?.axis ? `${latestPrescription.leftEye.axis}°` : '-'}
                    </td>
                    <td className="px-4 py-2.5 text-center">{latestPrescription.leftEye?.add || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-slate-600">
              <span>
                <strong className="text-slate-900">PD Distance:</strong>{' '}
                {latestPrescription.pdDistance || '-'}
              </span>
              <span>
                <strong className="text-slate-900">PD Near:</strong>{' '}
                {latestPrescription.pdNear || '-'}
              </span>
              {latestPrescription.remarks && (
                <span>
                  <strong className="text-slate-900">Remarks:</strong>{' '}
                  {latestPrescription.remarks}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>All optical invoices linked to {customer.name}</CardDescription>
          </div>
        </CardHeader>

        {bills.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No bills recorded yet"
            description="Create the first bill for this customer to see their invoice history here."
            action={
              <Button
                variant="primary"
                leftIcon={Plus}
                onClick={() => navigate('/billing', { state: { customer } })}
              >
                Create Bill
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow hover={false}>
                <TableHeaderCell>Bill No</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
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
              {bills.map((bill) => (
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
                    <p className="text-xs text-slate-600 max-w-[240px] truncate">
                      {(bill.items || []).map((i) => i.name).join(' + ')}
                    </p>
                  </TableCell>
                  <TableCell align="right" className="font-semibold tabular-nums whitespace-nowrap">
                    {formatCurrency(bill.grandTotal)}
                  </TableCell>
                  <TableCell align="right" className="tabular-nums whitespace-nowrap">
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
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/bills/${bill._id}`)}
                        title="View Invoice"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/bills/${bill._id}?print=true`)}
                        title="Print Invoice"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(bill)}
                        title="Download PDF"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
