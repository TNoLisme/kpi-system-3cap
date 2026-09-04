import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { Heatmap, LineChart } from '@/components/charts/Charts';
import { TrendingUp, Building2, Target, Award } from 'lucide-react';
import { UNIT_SUMMARIES, KPI_GROWTH_DATA } from '@/data/mockData';

export function StrategyDashboard() {
  const heatmapData = UNIT_SUMMARIES.map(u => ({
    name: u.name,
    code: u.code,
    progress: u.kpiProgress,
    status: u.kpiStatus,
  }));

  const totalStaff = UNIT_SUMMARIES.reduce((s, u) => s + u.totalStaff, 0);
  const totalCompleted = UNIT_SUMMARIES.reduce((s, u) => s + u.completedStaff, 0);
  const totalFlags = UNIT_SUMMARIES.reduce((s, u) => s + u.flagCount, 0);
  const avgKpi = Math.round(UNIT_SUMMARIES.reduce((s, u) => s + u.kpiProgress, 0) / UNIT_SUMMARIES.length);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Building2 size={20} className="text-primary-600" />
            </div>
            <Badge variant="blue">{UNIT_SUMMARIES.length} đơn vị</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tổng nhân sự</p>
          <p className="text-3xl font-bold text-neutral-900">{totalStaff}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-50">
              <Target size={20} className="text-success-600" />
            </div>
            <Badge variant="green">{Math.round((totalCompleted/totalStaff)*100)}%</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Hoàn thành KPI</p>
          <p className="text-3xl font-bold text-neutral-900">{totalCompleted}<span className="text-lg text-neutral-400 font-normal">/{totalStaff}</span></p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-warning-50">
              <TrendingUp size={20} className="text-warning-600" />
            </div>
            <Badge variant="yellow">Trung bình</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tiến độ KPI toàn trường</p>
          <p className="text-3xl font-bold text-neutral-900">{avgKpi}%</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-danger-50">
              <Award size={20} className="text-danger-600" />
            </div>
            <Badge variant="red">{totalFlags} nhân sự</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Cờ cảnh báo toàn trường</p>
          <p className="text-3xl font-bold text-danger-600">{totalFlags}</p>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="p-6">
        <SectionTitle title="Bản đồ KPI toàn trường" subtitle="Trạng thái hoàn thành KPI các đơn vị - Xanh: đúng tiến độ, Vàng: nguy cơ, Đỏ: chậm trễ" icon={<Building2 size={18} />} />
        <div className="pt-4">
          <Heatmap units={heatmapData} />
        </div>
      </Card>

      {/* Line Chart */}
      <Card className="p-6">
        <SectionTitle title="Tăng trưởng KPI tích lũy toàn trường" subtitle="Giá trị KPI qua các quý" icon={<TrendingUp size={18} />} />
        <div className="pt-4">
          <LineChart data={KPI_GROWTH_DATA.map(d => ({ label: d.quarter, value: d.value }))} height={260} color="#2563eb" />
        </div>
      </Card>
    </div>
  );
}
