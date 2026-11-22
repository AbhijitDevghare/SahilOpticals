import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ReceiptText,
  Glasses,
  BarChart3,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import logoSvg from '../assets/logo.svg';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ username, password, rememberMe });
      toast.success(`Welcome back, ${result?.user?.name || 'Admin'}!`);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Navy Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[44%] bg-navy-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl"
        />

        <div className="relative z-10 flex items-center gap-3.5">
          <img src={logoSvg} alt="Sahil Optical" className="h-11 w-11 rounded-xl shadow-md" />
          <div>
            <p className="text-xl font-bold tracking-tight leading-tight">Sahil Optical</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete Eye Care & Optical Showroom
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-400/20">
              Single-Shop Optical Billing Platform
            </span>
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight mt-4 leading-tight">
              Fast, accurate billing built for modern optical counters.
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Manage customer profiles, OD/OS eye prescriptions, itemized optical bills,
              GST invoices, and daily collections from one clean workspace.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              {
                icon: ReceiptText,
                title: 'Instant GST Tax Invoices',
                desc: 'Auto-calculated totals, advance tracking, print & PDF bills.',
              },
              {
                icon: Glasses,
                title: 'Integrated Eye Prescriptions',
                desc: 'Store OD/OS SPH, CYL, Axis, ADD, PD & lens type alongside bills.',
              },
              {
                icon: BarChart3,
                title: 'Clear Financial Visibility',
                desc: 'Track Cash, UPI, Card, Mixed payments and pending balances.',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.07]"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} Sahil Optical. All rights reserved.
        </p>
      </div>

      {/* Right Login Workspace */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile / Tablet Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-7">
            <img src={logoSvg} alt="Sahil Optical" className="h-10 w-10 rounded-xl shadow-sm" />
            <div>
              <p className="text-lg font-bold text-slate-900 leading-tight">Sahil Optical</p>
              <p className="text-xs text-slate-500">Optical Billing Suite</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access the Sahil Optical dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                leftIcon={User}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                leftIcon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-xs text-slate-400">Single-shop access</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
                rightIcon={ArrowRight}
                className="mt-2"
              >
                Sign In to Dashboard
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
