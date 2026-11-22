import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Plus,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Calendar,
} from 'lucide-react';
import Button from '../ui/Button';
import { formatTodayLabel, getInitials } from '../../utils/formatters';

export default function TopNavbar({
  title,
  user,
  onMenuOpen,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const displayName = user?.name || user?.username || 'Account';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          className="lg:hidden h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate leading-tight">
            {title}
          </h1>
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatTodayLabel()}</span>
          </p>
        </div>
      </div>

      {/* Right: Search + CTA + User Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Search (Desktop / Tablet) */}
        <div className="hidden md:block relative w-64 xl:w-72">
          <Search className="h-4 w-4 text-slate-400 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search bill no., customer..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-colors"
          />
        </div>

        {/* New Bill Primary CTA */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => navigate('/billing')}
          className="h-9 px-3 sm:px-3.5"
        >
          <span className="hidden sm:inline">New Bill</span>
          <span className="sm:hidden">Bill</span>
        </Button>

        {/* Subtle Notification Icon */}
        <button
          type="button"
          aria-label="View bills"
          title="View All Bills"
          onClick={() => navigate('/bills')}
          className="hidden sm:flex relative h-9 w-9 rounded-lg border border-slate-200 bg-white items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 h-9 pl-1.5 pr-2 sm:pr-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <div className="h-6 w-6 rounded-md bg-navy-900 text-white text-[11px] font-semibold flex items-center justify-center">
              {getInitials(displayName)}
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-800">{displayName}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-40">
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.username ? `@${user.username}` : 'Signed in'} · Sahil Optical
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Shop Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
                className="w-full px-3.5 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
