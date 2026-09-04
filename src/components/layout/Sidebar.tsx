import { type Role, type PageKey } from '@/types';
import { ROLE_CONFIGS } from '@/data/mockData';
import {
  LayoutDashboard, ClipboardList, CheckSquare, Award, MessageSquareWarning,
  User, GraduationCap, Users, Building2, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  role: Role;
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, ClipboardList, CheckSquare, Award, MessageSquareWarning,
  User, GraduationCap, Users, Building2, ShieldCheck,
};

const PAGE_LABELS: Record<PageKey, { label: string; icon: string }> = {
  'dashboard': { label: 'Bảng điều khiển', icon: 'LayoutDashboard' },
  'self-assessment': { label: 'Khai báo & Tự đánh giá', icon: 'ClipboardList' },
  'approval': { label: 'Quản lý duyệt phiếu', icon: 'CheckSquare' },
  'admin-classification': { label: 'Xếp loại & Ban hành', icon: 'Award' },
  'complaint': { label: 'Khiếu nại', icon: 'MessageSquareWarning' },
};

export function Sidebar({ role, activePage, onPageChange }: SidebarProps) {
  const config = ROLE_CONFIGS.find(r => r.role === role)!;
  const pages = config.pages;

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="px-5 py-5 border-b border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <Award size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-neutral-900 leading-tight">Hệ Thống KPI</h1>
            <p className="text-xs text-neutral-500">Đánh giá & Xếp loại</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Menu</p>
        <div className="flex flex-col gap-1">
          {pages.map(pageKey => {
            const page = PAGE_LABELS[pageKey];
            const Icon = ICON_MAP[page.icon] || LayoutDashboard;
            const isActive = activePage === pageKey;
            return (
              <button
                key={pageKey}
                onClick={() => onPageChange(pageKey)}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              >
                <Icon size={18} />
                <span>{page.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-neutral-200">
        <div className="px-3 py-2.5 rounded-lg bg-neutral-50">
          <p className="text-xs text-neutral-500 mb-1">Kỳ đánh giá hiện tại</p>
          <p className="text-sm font-semibold text-neutral-700">Quý 3 / 2026</p>
        </div>
      </div>
    </aside>
  );
}
