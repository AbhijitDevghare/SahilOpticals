import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import logoSvg from '../../assets/logo.svg';
import { NAV_ITEMS } from '../../utils/constants';
import UserProfileCard from './UserProfileCard';

export default function Sidebar({ user, onLogout, onNavigate, showCloseButton = false, onClose }) {
  return (
    <aside className="h-full w-64 bg-navy-900 text-slate-300 flex flex-col select-none border-r border-slate-800/90">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={logoSvg}
            alt="Sahil Optical"
            className="h-9 w-9 rounded-lg shrink-0 shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-white tracking-tight truncate leading-tight">
              Sahil Optical
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Optical Billing Suite
            </p>
          </div>
        </div>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={[
                      'h-[18px] w-[18px] shrink-0 transition-colors duration-150',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200',
                    ].join(' ')}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <UserProfileCard user={user} onLogout={onLogout} />
    </aside>
  );
}
