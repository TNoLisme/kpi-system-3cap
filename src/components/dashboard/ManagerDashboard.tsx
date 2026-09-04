import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { BarChart, PieChart } from '@/components/charts/Charts';
import { Users, FileCheck, AlertCircle, ArrowRight, CheckSquare } from 'lucide-react';
import { UNIT_SUMMARIES, PENDING_TICKETS, getClassificationLabel } from '@/data/mockData';

interface Props {
  onNavigate?: (page: string) => void;
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  A1: '#16a34a', A2: '#22c55e', B1: '#3b82f6', B2: '#60a5fa', C: '#f59e0b', D: '#ef4444',
};

export function ManagerDashboard({ onNavigate }: Props) {
  const pendingL1 = PENDING_TICKETS.filter(t => t.status === 'pending-l1').length;
  const pendingL2 = PENDING_TICKETS.filter(t => t.status === 'pending-l2').length;

  const unitComparison = UNIT_SUMMARIES.slice(0, 5).map(u => ({
    label: u.code,
    value: u.avgScore,
    highlight: u.flagCount > 2,
  }));

  const myUnit = UNIT_SUMMARIES[0];
  const pieData = myUnit.classificationDistribution
    .filter(d => d.count > 0)
    .map(d => ({
      label: getClassificationLabel(d.classification).split(' - ')[0],
      value: d.count,
      color: CLASSIFICATION_COLORS[d.classification],
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="p-5 cursor-pointer" >
          <div className="flex items-center justify-between" onClick={() => onNavigate?.('approval')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning-50">
                <CheckSquare size={22} className="text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{pendingL1}</p>
                <p className="text-sm text-neutral-500">Phiếu chờ duyệt cấp 2</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-neutral-400" />
          </div>
        </Card>
        <Card hover className="p-5 cursor-pointer">
          <div className="flex items-center justify-between" onClick={() => onNavigate?.('approval')}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary-50">
                <FileCheck size={22} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{pendingL2}</p>
                <p className="text-sm text-neutral-500">Phiếu chờ duyệt cấp 3</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-neutral-400" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-danger-50">
              <AlertCircle size={22} className="text-danger-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">
                {UNIT_SUMMARIES.reduce((sum, u) => sum + u.flagCount, 0)}
              </p>
              <p className="text-sm text-neutral-500">Nhân sự bị cờ cảnh báo</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Unit Comparison */}
        <Card className="p-6">
          <SectionTitle title="So sánh điểm KPI giữa đơn vị" subtitle="Trung bình điểm các tổ chuyên môn" icon={<Users size={18} />} />
          <div className="pt-4">
            <BarChart data={unitComparison} height={220} />
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary-500" />
              <span>Bình thường</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-danger-500" />
              <span>Cờ cảnh báo chặn trần</span>
            </div>
          </div>
        </Card>

        {/* Pie Chart - Classification Distribution */}
        <Card className="p-6">
          <SectionTitle title="Phân bổ xếp loại dự kiến" subtitle={`${myUnit.name} - Kiểm soát chỉ tiêu`} icon={<FileCheck size={18} />} />
          <div className="pt-4">
            <PieChart data={pieData} centerValue={String(myUnit.totalStaff)} centerLabel="Nhân sự" />
          </div>
        </Card>
      </div>

      {/* Unit Summary Table */}
      <Card className="p-6">
        <SectionTitle title="Tổng hợp đơn vị" subtitle="Trạng thái hoàn thành KPI" icon={<Users size={18} />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Đơn vị</th>
                <th className="table-header">Nhân sự</th>
                <th className="table-header">Hoàn thành</th>
                <th className="table-header">Điểm TB</th>
                <th className="table-header">KPI</th>
                <th className="table-header">Cờ cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {UNIT_SUMMARIES.map(u => (
                <tr key={u.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="table-cell font-medium text-neutral-800">{u.name}</td>
                  <td className="table-cell">{u.totalStaff}</td>
                  <td className="table-cell">{u.completedStaff}/{u.totalStaff}</td>
                  <td className="table-cell font-semibold">{u.avgScore}</td>
                  <td className="table-cell">
                    <Badge variant={u.kpiStatus === 'on-track' ? 'green' : u.kpiStatus === 'at-risk' ? 'yellow' : 'red'}>
                      {u.kpiProgress}%
                    </Badge>
                  </td>
                  <td className="table-cell">
                    {u.flagCount > 0 ? <Badge variant="red">{u.flagCount}</Badge> : <Badge variant="gray">0</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
