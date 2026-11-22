import { useEffect } from 'react';
import Sidebar from './Sidebar';

export default function MobileDrawer({ isOpen, onClose, user, onLogout }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative z-10 h-full w-64 max-w-[82vw] shadow-2xl">
        <Sidebar
          user={user}
          onLogout={() => {
            onClose();
            onLogout();
          }}
          onNavigate={onClose}
          showCloseButton
          onClose={onClose}
        />
      </div>
    </div>
  );
}
