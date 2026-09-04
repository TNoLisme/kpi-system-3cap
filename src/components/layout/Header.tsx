import { useState, useRef, useEffect } from 'react';
import { type Role, type User, type Notification } from '@/types';
import { ROLE_CONFIGS, PERIODS, NOTIFICATIONS } from '@/data/mockData';
import { Bell, Calendar, ChevronDown, Check, AlertTriangle, XCircle, Info, CheckCheck } from 'lucide-react';

interface HeaderProps {
  user: User;
  role: Role;
  onRoleChange: (role: Role) => void;
  period: string;
  onPeriodChange: (period: string) => void;
}

const NOTIF_ICONS = {
  approval: <Check size={16} className="text-success-600" />,
  rejected: <XCircle size={16} className="text-danger-600" />,
  warning: <AlertTriangle size={16} className="text-warning-600" />,
  info: <Info size={16} className="text-primary-600" />,
};

export function Header({ user, role, onRoleChange, period, onPeriodChange }: HeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showPeriod, setShowPeriod] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRole(false);
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setShowPeriod(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentRoleConfig = ROLE_CONFIGS.find(r => r.role === role)!;
  const currentPeriod = PERIODS.find(p => p.value === period);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">{currentRoleConfig.label}</h2>
        <p className="text-xs text-neutral-500">Hệ thống đánh giá KPI 3 cấp</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Period Filter */}
        <div ref={periodRef} className="relative">
          <button
            onClick={() => setShowPeriod(!showPeriod)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 hover:border-neutral-400 transition-colors text-sm"
          >
            <Calendar size={16} className="text-neutral-500" />
            <span className="text-neutral-700 font-medium">{currentPeriod?.label || 'Chọn kỳ'}</span>
            <ChevronDown size={14} className={`text-neutral-400 transition-transform ${showPeriod ? 'rotate-180' : ''}`} />
          </button>
          {showPeriod && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 animate-scale-in">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { onPeriodChange(p.value); setShowPeriod(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors ${p.value === period ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-700'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <Bell size={20} className="text-neutral-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Thông báo</h3>
                  <p className="text-xs text-neutral-500">{unreadCount} thông báo chưa đọc</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors"
                  >
                    <CheckCheck size={14} /> Đánh dấu đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markSingleRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/30' : ''}`}
                  >
                    <div className="mt-0.5">{NOTIF_ICONS[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-neutral-500' : 'text-neutral-700 font-medium'}`}>{n.message}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div ref={roleRef} className="relative">
          <button
            onClick={() => setShowRole(!showRole)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-neutral-800 leading-tight">{user.name}</p>
              <p className="text-xs text-neutral-500">{currentRoleConfig.label}</p>
            </div>
            <ChevronDown size={14} className={`text-neutral-400 transition-transform ${showRole ? 'rotate-180' : ''}`} />
          </button>
          {showRole && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 animate-scale-in">
              <div className="px-3 py-2 border-b border-neutral-200">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Chuyển vai trò (Demo)</p>
              </div>
              {ROLE_CONFIGS.map(rc => (
                <button
                  key={rc.role}
                  onClick={() => { onRoleChange(rc.role); setShowRole(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-primary-50 transition-colors ${rc.role === role ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-700'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${rc.role === role ? 'bg-primary-600' : 'bg-neutral-300'}`} />
                  {rc.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
