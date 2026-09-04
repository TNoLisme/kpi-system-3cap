import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { Heatmap, LineChart } from '@/components/charts/Charts';
import { TrendingUp, Building2, Target, Award, AlertTriangle } from 'lucide-react';
import { KPI_GROWTH_DATA } from '@/data/mockData';
import { useKpiStore } from '@/store/KpiStore';

export function StrategyDashboard() {
  const { state } = useKpiStore();

  const heatmapData = state.units.map(u => ({
    name: u.name,
    code: u.code,
    progress: u.kpiProgress,
    status: u.kpiCeiling === 'B3' || (u.kpiActualGrowth !== undefined && u.kpiActualGrowth < 5) ? ('at-risk' as const) : u.kpiStatus,
  }));

  const totalStaff = state.units.reduce((s, u) => s + u.totalStaff, 0);
  const totalCompleted = state.units.reduce((s, u) => s + u.completedStaff, 0);
  const totalFlags = state.units.reduce((s, u) => s + u.flagCount, 0);
  const avgKpi = Math.round(state.units.reduce((s, u) => s + u.kpiProgress, 0) / (state.units.length || 1));

  const cappedUnits = state.units.filter(u => u.kpiCeiling === 'B3' || (u.kpiActualGrowth !== undefined && u.kpiActualGrowth < 5));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Warning if any unit is capped at B3 */}
      {cappedUnits.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 animate-slide-up">
          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-amber-900">
                CÓ {cappedUnits.length} ĐƠN VỊ BỊ CHẶN TRẦN B3 DO KPI &lt; 5%
              </h4>
              <Badge variant="yellow">Chặn trần B3</Badge>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              Các đơn vị sau không đạt mức tăng trưởng KPI tối thiểu (5%):{' '}
              <strong>{cappedUnits.map(u => `${u.name} (${u.kpiActualGrowth ?? 4.2}%)`).join(', ')}</strong>.
              Theo Điều 14, toàn bộ nhân sự các đơn vị này bị giới hạn mức xếp loại tối đa là B3.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Building2 size={20} className="text-primary-600" />
            </div>
            <Badge variant="blue">{state.units.length} đơn vị</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tổng nhân sự</p>
          <p className="text-3xl font-bold text-neutral-900">{totalStaff}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-50">
              <Target size={20} className="text-success-600" />
            </div>
            <Badge variant="green">{Math.round((totalCompleted / (totalStaff || 1)) * 100)}%</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Hoàn thành KPI</p>
          <p className="text-3xl font-bold text-neutral-900">
            {totalCompleted}<span className="text-lg text-neutral-400 font-normal">/{totalStaff}</span>
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-warning-50">
              <TrendingUp size={20} className="text-warning-600" />
            </div>
            <Badge variant="yellow">Tiến độ Quý</Badge>
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

      {/* Heatmap & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionTitle
            title="Bản đồ nhiệt tiến độ KPI theo đơn vị"
            subtitle="Theo dõi tiến độ và cảnh báo chặn trần toàn trường"
            icon={<Target size={18} />}
          />
          <Heatmap units={heatmapData} />
        </Card>

        <Card className="p-6">
          <SectionTitle
            title="Xu hướng tăng trưởng KPI qua các quý"
            subtitle="Dữ liệu tổng hợp từ Q1/2025 đến nay"
            icon={<TrendingUp size={18} />}
          />
          <LineChart data={KPI_GROWTH_DATA.map(d => ({ label: d.quarter, value: d.value }))} />
        </Card>
      </div>
    </div>
  );
}
