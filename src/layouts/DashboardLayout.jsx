import { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopNavbar from '../components/navigation/TopNavbar';
import MobileDrawer from '../components/navigation/MobileDrawer';
import { useAuth } from '../hooks/useAuth';
import { NAV_ITEMS } from '../utils/constants';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const pageTitle = useMemo(() => {
    if (/^\/bills\/[^/]+$/.test(location.pathname)) return 'Bill Details & Invoice';
    if (/^\/customers\/[^/]+$/.test(location.pathname)) return 'Customer History';
    const active =
      NAV_ITEMS.find((item) => location.pathname.startsWith(item.path)) || NAV_ITEMS[0];
    return active.label;
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex print:bg-white">
      {/* Desktop Fixed Navy Sidebar */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:z-40 print:hidden">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Mobile & Tablet Slide-Over Drawer */}
      <div className="print:hidden">
        <MobileDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 print:pl-0">
        <div className="print:hidden">
          <TopNavbar
            title={pageTitle}
            user={user}
            onMenuOpen={() => setMobileMenuOpen(true)}
            onLogout={handleLogout}
            searchQuery={globalSearch}
            onSearchChange={setGlobalSearch}
          />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1440px] w-full mx-auto print:p-0 print:max-w-none">
          <Outlet context={{ globalSearch, setGlobalSearch }} />
        </main>
      </div>
    </div>
  );
}
