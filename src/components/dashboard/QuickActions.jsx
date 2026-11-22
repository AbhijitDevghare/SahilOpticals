import { useNavigate } from 'react-router-dom';
import {
  FilePlus2,
  UserPlus,
  ReceiptText,
  Glasses,
  BarChart3,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

const QUICK_ACTION_LIST = [
  {
    label: 'Create New Bill',
    description: 'Generate optical tax invoice',
    path: '/billing',
    icon: FilePlus2,
    primary: true,
  },
  {
    label: 'All Bills & Invoices',
    description: 'Search, view & print bills',
    path: '/bills',
    icon: ReceiptText,
  },
  {
    label: 'Customers',
    description: 'Lookup profiles & history',
    path: '/customers',
    icon: UserPlus,
  },
  {
    label: 'Product Catalogue',
    description: 'Manage frames & lens rates',
    path: '/products',
    icon: Glasses,
  },
  {
    label: 'Sales Reports',
    description: 'Daily & monthly summaries',
    path: '/reports',
    icon: BarChart3,
  },
  {
    label: 'Shop Settings',
    description: 'GSTIN, address & tagline',
    path: '/settings',
    icon: Settings,
  },
];

const MODE_BAR_COLORS = {
  UPI: 'bg-blue-600',
  Cash: 'bg-emerald-500',
  Card: 'bg-indigo-500',
  Mixed: 'bg-amber-500',
};

export default function QuickActions({ paymentModes = [] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequent daily counter tasks</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          {QUICK_ACTION_LIST.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className={[
                  'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-colors duration-150',
                  action.primary
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-white border-slate-200/80 text-slate-800 hover:bg-slate-50 hover:border-slate-300',
                ].join(' ')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={[
                      'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                      action.primary
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate leading-tight">
                      {action.label}
                    </p>
                    <p
                      className={[
                        'text-[11px] truncate mt-0.5',
                        action.primary ? 'text-blue-100' : 'text-slate-500',
                      ].join(' ')}
                    >
                      {action.description}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={[
                    'h-4 w-4 shrink-0',
                    action.primary ? 'text-blue-100' : 'text-slate-400',
                  ].join(' ')}
                />
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Payment Mode Breakdown Card */}
      <Card className="flex-1">
        <CardHeader>
          <div>
            <CardTitle>Payment Modes</CardTitle>
            <CardDescription>Share across Cash, UPI, Card & Mixed</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {paymentModes.map((item) => (
            <div key={item.mode}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{item.mode}</span>
                  <span className="text-slate-400">({item.count} bills)</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.barColor || MODE_BAR_COLORS[item.mode] || 'bg-blue-600'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
