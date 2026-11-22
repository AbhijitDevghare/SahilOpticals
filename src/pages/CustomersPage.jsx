import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Plus,
  Search,
  History,
  Pencil,
  Trash2,
  Users,
  FilePlus2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
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
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from '../services/customer.service';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate } from '../utils/formatters';

const EMPTY_FORM = { name: '', mobile: '', address: '' };

export default function CustomersPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const outletContext = useOutletContext() || {};

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const effectiveSearch = (search || outletContext.globalSearch || '').trim();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCustomers({ search: effectiveSearch });
      setCustomers(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load customers.'));
    } finally {
      setLoading(false);
    }
  }, [effectiveSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || '',
      mobile: customer.mobile || '',
      address: customer.address || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.mobile.trim()) {
      setFormError('Customer name and mobile number are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, {
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          address: form.address.trim(),
        });
        toast.success('Customer updated successfully.');
      } else {
        const res = await createCustomer({
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          address: form.address.trim(),
        });
        toast.success(res.message);
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Unable to save customer.'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await deleteCustomer(customerToDelete._id);
      toast.success(`Deleted customer ${customerToDelete.name}.`);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Unable to delete customer.');
      toast.error(msg);
      setCustomerToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage customer profiles and view complete billing & eye prescription history."
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={openAddModal}>
            Add Customer
          </Button>
        }
      />

      {/* Search Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Search by customer name, mobile number, or address..."
              leftIcon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500 tabular-nums shrink-0">
            Total: <strong className="text-slate-900">{customers.length}</strong>{' '}
            {customers.length === 1 ? 'customer' : 'customers'}
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center justify-between gap-3 text-sm text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={fetchCustomers}>
            Retry
          </Button>
        </div>
      )}

      {/* Customer Directory Table */}
      <Card>
        {loading ? (
          <LoadingState message="Loading customers..." />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Add a new customer or clear your search filter."
            action={
              <Button variant="primary" leftIcon={Plus} onClick={openAddModal}>
                Add Customer
              </Button>
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHead>
                  <TableRow hover={false}>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Mobile</TableHeaderCell>
                    <TableHeaderCell>Address</TableHeaderCell>
                    <TableHeaderCell align="center">Bills</TableHeaderCell>
                    <TableHeaderCell align="right">Total Spent</TableHeaderCell>
                    <TableHeaderCell align="right">Pending</TableHeaderCell>
                    <TableHeaderCell>Last Visit</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((cust) => (
                    <TableRow key={cust._id}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => navigate(`/customers/${cust._id}`)}
                          className="font-semibold text-slate-900 hover:text-blue-700 text-left"
                        >
                          {cust.name}
                        </button>
                      </TableCell>
                      <TableCell className="tabular-nums text-slate-700 whitespace-nowrap">
                        {cust.mobile}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs text-slate-500 max-w-[240px] truncate" title={cust.address}>
                          {cust.address || '-'}
                        </p>
                      </TableCell>
                      <TableCell align="center" className="font-semibold tabular-nums">
                        {cust.billCount ?? 0}
                      </TableCell>
                      <TableCell align="right" className="font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(cust.totalSpent ?? 0)}
                      </TableCell>
                      <TableCell
                        align="right"
                        className={[
                          'font-semibold tabular-nums whitespace-nowrap',
                          (cust.pendingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600',
                        ].join(' ')}
                      >
                        {formatCurrency(cust.pendingBalance ?? 0)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        {cust.lastVisit ? formatDate(cust.lastVisit) : 'No bills yet'}
                      </TableCell>
                      <TableCell align="right">
                        <div className="inline-flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/customers/${cust._id}`)}
                            title="Billing History"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/billing', { state: { customer: cust } })}
                            title="Create New Bill"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <FilePlus2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(cust)}
                            title="Edit Customer"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomerToDelete(cust)}
                            title="Delete Customer"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100">
              {customers.map((cust) => (
                <div key={cust._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{cust.name}</p>
                      <p className="text-xs text-slate-500 tabular-nums">{cust.mobile}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {cust.billCount ?? 0} {(cust.billCount ?? 0) === 1 ? 'bill' : 'bills'}
                    </span>
                  </div>
                  {cust.address && <p className="text-xs text-slate-500">{cust.address}</p>}
                  <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2 tabular-nums">
                    <span>
                      Spent: <strong className="text-slate-900">{formatCurrency(cust.totalSpent ?? 0)}</strong>
                    </span>
                    <span>
                      Pending:{' '}
                      <strong className={(cust.pendingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatCurrency(cust.pendingBalance ?? 0)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <Button
                      variant="soft"
                      size="sm"
                      leftIcon={History}
                      onClick={() => navigate(`/customers/${cust._id}`)}
                    >
                      History
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Pencil}
                      onClick={() => openEditModal(cust)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        description="Customer mobile number is used for quick lookup and autofill during billing."
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700">
              {formError}
            </div>
          )}
          <Input
            label="Full Name *"
            placeholder="e.g. Rajesh Kulkarni"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Mobile Number *"
            placeholder="e.g. 9822011223"
            value={form.mobile}
            onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
          />
          <Textarea
            label="Address"
            rows={2}
            placeholder="Residential address"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Customer"
        message={
          customerToDelete
            ? `Delete customer ${customerToDelete.name} (${customerToDelete.mobile})? Customers with existing bills cannot be deleted.`
            : ''
        }
        confirmLabel="Delete Customer"
      />
    </div>
  );
}
