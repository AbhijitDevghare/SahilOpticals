import { useCallback, useEffect, useState } from 'react';
import { Store, Save, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import LoadingState from '../components/ui/LoadingState';
import { getShopSettings, updateShopSettings } from '../services/shop.service';
import { getApiErrorMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function ShopSettingsPage() {
  const { user, updateCredentials } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    shopName: '',
    tagline: '',
    address: '',
    mobile: '',
    email: '',
    GSTIN: '',
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Account & Security state
  const [accountForm, setAccountForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [accountError, setAccountError] = useState('');
  const [accountSaved, setAccountSaved] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setAccountForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        username: user.username || prev.username,
      }));
    }
  }, [user]);

  const loadShop = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getShopSettings();
      if (data) {
        setForm({
          shopName: data.shopName || '',
          tagline: data.tagline || '',
          address: data.address || '',
          mobile: data.mobile || '',
          email: data.email || '',
          GSTIN: data.GSTIN || '',
        });
      }
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load shop settings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShop();
  }, [loadShop]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (savedMessage) setSavedMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSavedMessage('');

    if (!form.shopName.trim() || !form.mobile.trim() || !form.address.trim()) {
      setFormError('Shop name, mobile number, and address are required.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateShopSettings({
        shopName: form.shopName.trim(),
        tagline: form.tagline.trim(),
        address: form.address.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        GSTIN: form.GSTIN.trim().toUpperCase(),
      });
      setForm({
        shopName: updated.shopName || '',
        tagline: updated.tagline || '',
        address: updated.address || '',
        mobile: updated.mobile || '',
        email: updated.email || '',
        GSTIN: updated.GSTIN || '',
      });
      const msg = 'Shop profile updated in MongoDB. Invoices and PDFs now reflect these details.';
      setSavedMessage(msg);
      toast.success('Shop settings saved.');
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to save shop settings.');
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSaved('');

    if (!accountForm.currentPassword) {
      setAccountError('Current password is required to save account changes.');
      return;
    }

    if (accountForm.newPassword && accountForm.newPassword.length < 6) {
      setAccountError('New password must be at least 6 characters long.');
      return;
    }

    if (accountForm.newPassword !== accountForm.confirmPassword) {
      setAccountError('New password and confirm password do not match.');
      return;
    }

    setSavingAccount(true);
    try {
      await updateCredentials({
        name: accountForm.name.trim(),
        username: accountForm.username.trim(),
        currentPassword: accountForm.currentPassword,
        ...(accountForm.newPassword ? { newPassword: accountForm.newPassword } : {}),
      });
      setAccountForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setAccountSaved('Login credentials updated in MongoDB.');
      toast.success('Account credentials updated.');
    } catch (err) {
      const msg = err.message || 'Failed to update account credentials.';
      setAccountError(msg);
      toast.error(msg);
    } finally {
      setSavingAccount(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading shop settings..." />;
  }

  if (loadError) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-6 flex items-center justify-between gap-4">
        <div className="flex items-start gap-2.5 text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="text-sm font-semibold">Unable to load shop settings</p>
            <p className="text-xs text-rose-700 mt-0.5">{loadError}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" leftIcon={RefreshCw} onClick={loadShop}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shop Settings"
        subtitle="Configure Sahil Optical store details displayed on bills, printable invoices, and PDFs."
      />

      {formError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {savedMessage && (
        <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Settings Form */}
        <div className="xl:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Shop Profile</CardTitle>
                  <CardDescription>Single-shop identity & GST registration details</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Shop Name *"
                    placeholder="Sahil Optical"
                    value={form.shopName}
                    onChange={(e) => handleChange('shopName', e.target.value)}
                  />
                  <Input
                    label="Tagline"
                    placeholder="Complete Eye Care & Optical Showroom"
                    value={form.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Number *"
                    placeholder="98765 43210"
                    value={form.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="billing@sahiloptical.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>

                <Input
                  label="GSTIN"
                  placeholder="e.g. 27AABCS1429B1Z1"
                  value={form.GSTIN}
                  onChange={(e) => handleChange('GSTIN', e.target.value.toUpperCase())}
                />

                <Textarea
                  label="Shop Address *"
                  rows={3}
                  placeholder="Full showroom street address, landmark, city & pincode"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" variant="primary" leftIcon={Save} loading={saving}>
                    Save Shop Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Invoice Header Preview */}
        <div className="xl:col-span-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Live Invoice Header Preview</CardTitle>
                <CardDescription>How your shop profile renders on printed & PDF bills</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="bg-navy-900 text-white p-5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold tracking-tight">
                        {form.shopName || 'Sahil Optical'}
                      </p>
                      {form.tagline && (
                        <p className="text-xs text-slate-400 mt-0.5">{form.tagline}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 shrink-0">
                      Tax Invoice
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-0.5 text-xs text-slate-300">
                    <p>{form.address || 'Shop address will appear here'}</p>
                    <p>
                      {form.mobile ? `Mob: ${form.mobile}` : ''}
                      {form.mobile && form.email ? ' | ' : ''}
                      {form.email ? `Email: ${form.email}` : ''}
                    </p>
                    {form.GSTIN && (
                      <p className="font-semibold text-slate-200">GSTIN: {form.GSTIN}</p>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 px-5 py-3 text-[11px] text-slate-500">
                  Saved changes persist in MongoDB and apply to all viewed, printed, and PDF invoices.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account & Security Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle>Account & Login Credentials</CardTitle>
                  <CardDescription>
                    Update your admin display name, login username, or password
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {accountError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{accountError}</span>
                </div>
              )}

              {accountSaved && (
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{accountSaved}</span>
                </div>
              )}

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    placeholder="Your name"
                    value={accountForm.name}
                    onChange={(e) =>
                      setAccountForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                  <Input
                    label="Login Username"
                    placeholder="Choose your username"
                    value={accountForm.username}
                    onChange={(e) =>
                      setAccountForm((p) => ({ ...p, username: e.target.value }))
                    }
                  />
                </div>

                <Input
                  label="Current Password *"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter current password to confirm"
                  value={accountForm.currentPassword}
                  onChange={(e) =>
                    setAccountForm((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password (Optional)"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={accountForm.confirmPassword}
                    onChange={(e) =>
                      setAccountForm((p) => ({ ...p, confirmPassword: e.target.value }))
                    }
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={Save}
                    loading={savingAccount}
                  >
                    Update Credentials
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
