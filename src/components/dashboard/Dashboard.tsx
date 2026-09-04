import { type Role } from '@/types';
import { PersonalDashboard } from './PersonalDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { UnitDashboard } from './UnitDashboard';
import { StrategyDashboard } from './StrategyDashboard';
import { DisciplineDashboard } from './DisciplineDashboard';

interface DashboardProps {
  role: Role;
  onNavigate?: (page: string) => void;
}

export function Dashboard({ role, onNavigate }: DashboardProps) {
  switch (role) {
    case 'chuyen-vien':
    case 'giang-vien':
      return <PersonalDashboard />;
    case 'truong-khoa':
      return <ManagerDashboard onNavigate={onNavigate} />;
    case 'lanh-dao':
      return <UnitDashboard role={role} />;
    case 'ban-giam-hieu':
      return <StrategyDashboard />;
    case 'thanh-tra':
      return <DisciplineDashboard />;
    default:
      return <PersonalDashboard />;
  }
}
