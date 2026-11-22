import { LogOut } from 'lucide-react';
import { getInitials } from '../../utils/formatters';

export default function UserProfileCard({ user, onLogout }) {
  const displayName = user?.name || user?.username || 'Account';
  const roleLabel = user?.role === 'admin' ? 'Shop Admin' : 'Staff';

  return (
    <div className="p-3 border-t border-slate-800/80 bg-navy-950/40">
      <div className="flex items-center gap-3 rounded-xl px-2.5 py-2 bg-slate-800/40 border border-slate-700/40">
        <div className="h-9 w-9 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm">
          {getInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate leading-tight">
            {displayName}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {roleLabel} · Sahil Optical
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/70 transition-colors duration-150 shrink-0"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
