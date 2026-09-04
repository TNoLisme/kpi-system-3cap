import { useState, useMemo } from 'react';
import { Card, SectionTitle, Badge, Select } from '@/components/ui/Primitives';
import { RadarChart } from '@/components/charts/Charts';
import { Tooltip } from '@/components/ui/Tooltip';
import { Building2, Award, Flag, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';
import { useKpiStore } from '@/store/KpiStore';
import { type Role } from '@/types';

interface UnitDashboardProps {
  role?: Role;
}

export function UnitDashboard(props?: UnitDashboardProps) {
  void props;
  const { state, dispatch } = useKpiStore();
  const [selectedUnitId, setSelectedUnitId] = useState(state.units[0]?.id || 'unit01');

  const selectedUnit = useMemo(() => {
    return state.units.find(u => u.id === selectedUnitId) || state.units[0];
  }, [state.units, selectedUnitId]);

  const unitOptions = useMemo(() => {
    return state.units.map(u => ({ value: u.id, label: u.name }));
  }, [state.units]);

  const competencyAxes = [
    { label: 'Chất lượng', value: selectedUnit?.avgCompetency.quality || 80, max: 100 },
    { label: 'Tuân thủ', value: selectedUnit?.avgCompetency.timeliness || 80, max: 100 },
    { label: 'Phối hợp', value: selectedUnit?.avgCompetency.collaboration || 80, max: 100 },
    { label: 'Cải tiến', value: selectedUnit?.avgCompetency.innovation || 80, max: 100 },
  ];


  const handleKpiGrowthChange = (newVal: number) => {
    if (state.isFrozen) return;
    dispatch({
      type: 'UPDATE_UNIT_KPI',
      unitId: selectedUnit.id,
      value: newVal,
    });
  };

  const isCappedB3 = selectedUnit?.kpiCeiling === 'B3' || (selectedUnit?.kpiActualGrowth !== undefined && selectedUnit.kpiActualGrowth < 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Unit Filter & Growth Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
            Đơn vị trực thuộc
          </label>
          <Select
            value={selectedUnitId}
            onChange={setSelectedUnitId}
            options={unitOptions}
            className="max-w-xs"
          />
        </div>

        {/* Input % Giá trị KPI thực tế tăng thêm */}
        <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-neutral-700">% KPI thực tế tăng thêm trong Quý:</span>
              <Tooltip content="Theo Điều 14 Quy chế KPI: Nếu giá trị KPI thực tế tăng thêm của đơn vị < 5%, toàn bộ cá nhân trong đơn vị bị khống chế trần tối đa mức B3 (Tốt).">
                <HelpCircle size={14} className="text-neutral-400 cursor-pointer" />
              </Tooltip>
            </div>
            <p className="text-[11px] text-neutral-500">Ngưỡng đạt yêu cầu: ≥ 5.0%</p>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              disabled={state.isFrozen}
              value={selectedUnit?.kpiActualGrowth ?? 5.5}
              onChange={e => handleKpiGrowthChange(parseFloat(e.target.value) || 0)}
              className="input w-24 text-center font-bold text-primary-700"
            />
            <span className="text-sm font-semibold text-neutral-600">%</span>
          </div>
        </div>
      </div>

      {/* Cảnh báo chặn trần B3 tức thời */}
      {isCappedB3 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 animate-slide-up">
          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-amber-900">
                CHẶN TRẦN TỐI ĐA MỨC B3 THEO QUY CHẾ KPI ĐƠN VỊ
              </h4>
              <Badge variant="yellow">Trần B3</Badge>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              Giá trị KPI thực tế tăng thêm của {selectedUnit?.name} đạt <strong>{selectedUnit?.kpiActualGrowth}%</strong> (&lt; 5%). Toàn bộ nhân sự thuộc đơn vị này sẽ bị áp mức trần tối đa là <strong>B3 (Tốt)</strong>, không được xét bậc A1, A2, A3, B1, B2 bất kể tổng điểm cá nhân đạt mức nào.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Award size={20} className="text-primary-600" />
            </div>
            <Badge variant="blue">Trung bình</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tổng điểm trung bình đơn vị</p>
          <p className="text-3xl font-bold text-neutral-900">{selectedUnit?.avgScore || 0}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-50">
              <Building2 size={20} className="text-success-600" />
            </div>
            <Badge variant="green">{Math.round(((selectedUnit?.completedStaff || 0) / (selectedUnit?.totalStaff || 1)) * 100)}%</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Nhân sự hoàn thành</p>
          <p className="text-3xl font-bold text-neutral-900">
            {selectedUnit?.completedStaff}<span className="text-lg text-neutral-400 font-normal">/{selectedUnit?.totalStaff}</span>
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-warning-50">
              <TrendingUp size={20} className="text-warning-600" />
            </div>
            <Badge variant={isCappedB3 ? 'yellow' : 'green'}>
              {isCappedB3 ? 'Dưới ngưỡng 5%' : 'Đạt chuẩn'}
            </Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">% KPI tăng thêm</p>
          <p className={`text-3xl font-bold ${isCappedB3 ? 'text-amber-600' : 'text-neutral-900'}`}>
            {selectedUnit?.kpiActualGrowth ?? 5.5}%
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-danger-50">
              <Flag size={20} className="text-danger-600" />
            </div>
            {selectedUnit?.flagCount ? <Badge variant="red">{selectedUnit.flagCount} cờ</Badge> : null}
          </div>
          <p className="text-sm text-neutral-500 mb-1">Cờ cảnh báo vi phạm</p>
          <p className="text-3xl font-bold text-danger-600">{selectedUnit?.flagCount || 0}</p>
        </Card>
      </div>

      {/* Detail Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionTitle
            title="Đánh giá năng lực đơn vị"
            subtitle="Điểm trung bình theo 4 trục năng lực chính"
            icon={<Award size={18} />}
          />
          <RadarChart axes={competencyAxes} />
        </Card>

        <Card className="p-6">
          <SectionTitle
            title="Phân bố xếp loại nhân sự"
            subtitle="Tỷ lệ đạt các bậc sau khi áp dụng trần"
            icon={<Building2 size={18} />}
          />
          <div className="space-y-3 pt-2">
            {selectedUnit?.classificationDistribution?.map(cd => (
              <div key={cd.classification} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 font-bold text-sm text-neutral-700">{cd.classification}</span>
                  <span className="text-xs text-neutral-500">Mức xếp loại {cd.classification}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${(cd.count / (selectedUnit?.totalStaff || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-neutral-800 w-8 text-right">{cd.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
