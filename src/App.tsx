import { useState } from 'react';
import { type Role, type PageKey } from '@/types';
import { ROLE_CONFIGS, CURRENT_USER, CURRENT_PERIOD } from '@/data/mockData';
import { ToastProvider } from '@/components/ui/Toast';
import { KpiStoreProvider } from '@/store/KpiStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { SelfAssessment } from '@/components/modules/SelfAssessment';
import { ApprovalManagement } from '@/components/modules/ApprovalManagement';
import { AdminClassification } from '@/components/modules/AdminClassification';
import { ComplaintModule } from '@/components/modules/ComplaintModule';

function AppContent() {
  const [role, setRole] = useState<Role>('chuyen-vien');
  const [page, setPage] = useState<PageKey>('dashboard');
  const [period, setPeriod] = useState(CURRENT_PERIOD);

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    const config = ROLE_CONFIGS.find(r => r.role === newRole)!;
    setPage(config.defaultPage);
  };

  const handleNavigate = (target: string) => {
    if (target === 'approval') setPage('approval');
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard role={role} onNavigate={handleNavigate} />;
      case 'self-assessment':
        return <SelfAssessment role={role} />;
      case 'approval':
        return <ApprovalManagement role={role} />;
      case 'admin-classification':
        return <AdminClassification />;
      case 'complaint':
        return <ComplaintModule isUserComplaint={role === 'chuyen-vien' || role === 'giang-vien'} />;
      default:
        return <Dashboard role={role} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar role={role} activePage={page} onPageChange={setPage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={CURRENT_USER}
          role={role}
          onRoleChange={handleRoleChange}
          period={period}
          onPeriodChange={setPeriod}
        />
        <main className="flex-1 p-6 overflow-x-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <KpiStoreProvider>
        <AppContent />
      </KpiStoreProvider>
    </ToastProvider>
  );
}
