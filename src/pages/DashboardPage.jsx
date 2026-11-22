import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  ReceiptText,
  IndianRupee,
  Users,
  Clock3,
  Plus,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import Button from '../components/ui/Button';
import LoadingState from '../components/ui/LoadingState';
import StatCard from '../components/dashboard/StatCard';
import SalesOverviewChart from '../components/dashboard/SalesOverviewChart';
import QuickActions from '../components/dashboard/QuickActions';
import RecentBillsTable from '../components/dashboard/RecentBillsTable';
import { getDashboardOverview } from '../services/dashboard.service';
import { downloadBillPdf } from '../services/bill.service';
import { getShopSettings } from '../services/shop.service';
import { getApiErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};
  const globalSearch = outletContext.globalSearch || '';

  const [dashboard, setDashboard] = useState(null);
  const [shopName, setShopName] = useState('Sahil Optical');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, shopRes] = await Promise.all([
        getDashboardOverview(),
        getShopSettings().catch(() => null),
      ]);
      setDashboard(statsRes);
      if (shopRes?.shopName) setShopName(shopRes.shopName);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load dashboard statistics.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleBillAction = async (actionType, bill) => {
    if (actionType === 'view') {
      navigate(`/bills/${bill._id}`);
    } else if (actionType === 'print') {
      navigate(`/bills/${bill._id}?print=true`);
    } else if (actionType === 'pdf') {
      try {
        await downloadBillPdf(bill._id, bill.billNumber);
        toast.success(`Downloaded PDF for ${bill.billNumber}`);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to download invoice PDF.'));
      }
    }
  };

  const firstName = (user?.name || 'Admin').split(' ')[0];

  if (loading) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="text-sm font-semibold">Unable to load dashboard</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={loadDashboard}>
          Retry
        </Button>
      </div>
    );
  }

  const paidCount = dashboard.statusCounts?.paid || 0;
  const partialCount = dashboard.statusCounts?.partial || 0;
  const pendingCount = dashboard.statusCounts?.pending || 0;
  const openDuesCount = partialCount + pendingCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle={`Live billing, sales, and payment overview for ${shopName}.`}
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              leftIcon={BarChart3}
              onClick={() => navigate('/reports')}
            >
              View Reports
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={Plus}
              onClick={() => navigate('/billing')}
            >
              Create New Bill
            </Button>
          </>
        }
      />

      {/* 4 KPI Statistics Cards (Live MongoDB data) */}
      <section
        aria-label="Key performance metrics"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        <StatCard
          title="Total Bills"
          value={Number(dashboard.totalBills || 0).toLocaleString('en-IN')}
          subtitle={`${paidCount} Paid · ${partialCount} Partial · ${pendingCount} Pending`}
          icon={ReceiptText}
          tone="blue"
        />

        <StatCard
          title="Total Sales"
          value={formatCurrency(dashboard.totalSales)}
          subtitle={`Avg. ${formatCurrency(dashboard.avgBillValue)} per bill`}
          icon={IndianRupee}
          tone="emerald"
        />

        <StatCard
          title="Total Customers"
          value={Number(dashboard.totalCustomers || 0).toLocaleString('en-IN')}
          subtitle="Registered optical customers"
          icon={Users}
          tone="indigo"
        />

        <StatCard
          title="Pending Payments"
          value={formatCurrency(dashboard.pendingPayments)}
          subtitle={`${partialCount} Partial · ${pendingCount} Pending bills`}
          trend={openDuesCount > 0 ? `${openDuesCount} open` : undefined}
          trendVariant="warning"
          icon={Clock3}
          tone="amber"
        />
      </section>

      {/* Middle Row: Sales Overview Chart + Quick Actions & Payment Modes */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        <div className="xl:col-span-8">
          <SalesOverviewChart data={dashboard.monthlySalesSummary || []} />
        </div>
        <div className="xl:col-span-4">
          <QuickActions paymentModes={dashboard.paymentModes || []} />
        </div>
      </section>

      {/* Bottom Row: Recent Bills Table */}
      <section>
        <RecentBillsTable
          bills={dashboard.recentBills || []}
          externalSearch={globalSearch}
          onBillAction={handleBillAction}
        />
      </section>
    </div>
  );
}
