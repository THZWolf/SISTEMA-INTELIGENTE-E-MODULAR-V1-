import React from 'react';
import { CheckCircle, AlertTriangle, Activity, Zap, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      aria-live="polite" 
      aria-atomic="true"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let borderColor = 'border-indigo-700/80';
        let bgBadge = 'bg-indigo-950/80 text-indigo-300 border-indigo-700';
        let IconComponent = Activity;
        let iconColor = 'text-indigo-400';

        if (toast.type === 'success') {
          borderColor = 'border-emerald-700/80';
          bgBadge = 'bg-emerald-950/80 text-emerald-300 border-emerald-700';
          IconComponent = CheckCircle;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          borderColor = 'border-amber-700/80';
          bgBadge = 'bg-amber-950/80 text-amber-300 border-amber-700';
          IconComponent = Zap;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'critical') {
          borderColor = 'border-red-700/80';
          bgBadge = 'bg-red-950/80 text-red-300 border-red-700';
          IconComponent = AlertTriangle;
          iconColor = 'text-red-400';
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto bg-slate-900/95 backdrop-blur-md border ${borderColor} rounded-xl p-3.5 shadow-2xl transition-all duration-300 flex items-start gap-3 relative group overflow-hidden animate-in fade-in slide-in-from-top-2`}
          >
            <div className={`p-1.5 rounded-lg border ${bgBadge} flex-shrink-0 mt-0.5`}>
              <IconComponent size={16} className={iconColor} />
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center justify-between gap-2">
                <h5 className="text-xs font-semibold font-mono text-slate-100 tracking-wide truncate">
                  {toast.title}
                </h5>
                <span className="text-[9px] font-mono text-slate-500 flex-shrink-0">
                  {toast.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono mt-1 leading-snug break-words">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar notificação"
              className="absolute top-2.5 right-2 text-slate-500 hover:text-slate-200 transition-colors p-1 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
