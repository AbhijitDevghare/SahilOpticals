import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  ReceiptText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import { Card } from '../components/ui/Card';
import PrintableInvoice from '../components/invoice/PrintableInvoice';
import { downloadBillPdf, getBillById } from '../services/bill.service';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function BillDetailsPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBillById(id);
      setInvoice(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load invoice details.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  useEffect(() => {
    if (invoice && searchParams.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.print();
        setSearchParams({}, { replace: true });
      }, 250);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [invoice, searchParams, setSearchParams]);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setDownloadingPdf(true);
    try {
      await downloadBillPdf(invoice._id, invoice.billNumber);
      toast.success(`Downloaded Invoice-${invoice.billNumber}.pdf`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to download PDF.'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading invoice..." />;
  }

  if (error) {
    return (
      <Card className="p-6 max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm font-semibold text-slate-900">Unable to load invoice</p>
          <p className="text-xs text-slate-500">{error}</p>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="secondary" leftIcon={ArrowLeft} onClick={() => navigate('/bills')}>
              Back to Bills
            </Button>
            <Button variant="primary" leftIcon={RefreshCw} onClick={loadInvoice}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <EmptyState
          icon={ReceiptText}
          title="Bill not found"
          description="This invoice may have been deleted or the bill ID is invalid."
          action={
            <Button variant="primary" leftIcon={ArrowLeft} onClick={() => navigate('/bills')}>
              Back to All Bills
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Action Bar (hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" leftIcon={ArrowLeft} onClick={() => navigate('/bills')}>
            All Bills
          </Button>
          {invoice.customer?._id && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={User}
              onClick={() => navigate(`/customers/${invoice.customer._id}`)}
            >
              Customer History
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            leftIcon={Download}
            loading={downloadingPdf}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={Printer}
            onClick={() => window.print()}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Printable Invoice Sheet */}
      <PrintableInvoice bill={invoice} shop={invoice.shop} />
    </div>
  );
}
