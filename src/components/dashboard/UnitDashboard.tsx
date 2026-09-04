import { useState } from 'react';
import { Card, SectionTitle, Badge, Select } from '@/components/ui/Primitives';
import { RadarChart, BarChart } from '@/components/charts/Charts';
import { Tooltip } from '@/components/ui/Tooltip';
import { Building2, Award, AlertCircle, Flag } from 'lucide-react';
import { UNIT_SUMMARIES, UNIT_LEADERBOARD } from '@/data/mockData';

export function UnitDashboard() {
  const [selectedUnitId, setSelectedUnitId] = useState(UNIT_SUMMARIES[0].id);
  const selectedUnit = UNIT_SUMMARIES.find(u => u.id === selectedUnitId)!;

  const unitOptions = UNIT_SUMMARIES.map(u => ({ value: u.id, label: u.name }));

  const competencyAxes = [
    { label: 'Chất lượng', value: selectedUnit.avgCompetency.quality, max: 100 },
    { label: 'Tuân thủ', value: selectedUnit.avgCompetency.timeliness, max: 100 },
    { label: 'Phối hợp', value: selectedUnit.avgCompetency.collaboration, max: 100 },
    { label: 'Cải tiến', value: selectedUnit.avgCompetency.innovation, max: 100 },
  ];

  const leaderboardData = UNIT_LEADERBOARD.map(p => ({
    label: p.name.split(' ').slice(-1)[0],
    value: p.score,
    highlight: p.flag,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Unit Filter & Summary Cards */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-600 mb-1.5">Chọn đơn vị</label>
          <Select
            value={selectedUnitId}
            onChange={setSelectedUnitId}
            options={unitOptions}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Award size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tổng điểm trung bình</p>
          <p className="text-3xl font-bold text-neutral-900">{selectedUnit.avgScore}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-50">
              <Building2 size={20} className="text-success-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tổng sản phẩm hoàn thành</p>
          <p className="text-3xl font-bold text-neutral-900">{selectedUnit.completedStaff}<span className="text-lg text-neutral-400 font-normal">/{selectedUnit.totalStaff}</span></p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-warning-50">
              <AlertCircle size={20} className="text-warning-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tiến độ KPI</p>
          <p className="text-3xl font-bold text-neutral-900">{selectedUnit.kpiProgress}%</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-danger-50">
              <Flag size={20} className="text-danger-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Cờ cảnh báo chặn trần</p>
          <p className="text-3xl font-bold text-danger-600">{selectedUnit.flagCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="p-6">
          <SectionTitle title="Năng lực trung bình đơn vị" subtitle={`Đánh giá 4 trục - ${selectedUnit.name}`} icon={<Building2 size={18} />} />
          <div className="flex justify-center py-4">
            <RadarChart axes={competencyAxes} size={260} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {competencyAxes.map(a => (
              <div key={a.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-neutral-50">
                <span className="text-sm text-neutral-600">{a.label}</span>
                <span className="text-sm font-semibold text-neutral-800">{a.value}/100</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6">
          <SectionTitle title="Xếp hạng điểm nhân sự" subtitle="Highlight: nhân sự bị cờ cảnh báo" icon={<Award size={18} />} />
          <div className="pt-4">
            <BarChart data={leaderboardData} height={240} />
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary-500" />
              <span>Bình thường</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-danger-500" />
              <span>Cờ chặn trần xếp loại</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Leaderboard Table */}
      <Card className="p-6">
        <SectionTitle title="Bảng chi tiết xếp hạng" subtitle={`${selectedUnit.name}`} icon={<Award size={18} />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header" style={{ position: 'sticky', left: 0, background: 'white' }}>Hạng</th>
                <th className="table-header" style={{ position: 'sticky', left: 48, background: 'white' }}>Nhân sự</th>
                <th className="table-header">Đơn vị</th>
                <th className="table-header">Điểm</th>
                <th className="table-header">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {UNIT_LEADERBOARD.map((p, i) => (
                <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="table-cell font-bold" style={{ position: 'sticky', left: 0, background: 'white' }}>
                    <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs ${i < 3 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="table-cell font-medium" style={{ position: 'sticky', left: 48, background: 'white' }}>{p.name}</td>
                  <td className="table-cell">{p.unit}</td>
                  <td className="table-cell font-semibold">{p.score}</td>
                  <td className="table-cell">
                    {p.flag ? (
                      <Tooltip content="Nhân sự vướng lỗi vi phạm - Bị chặn trần xếp loại">
                        <Badge variant="red"><Flag size={12} /> Cờ cảnh báo</Badge>
                      </Tooltip>
                    ) : (
                      <Badge variant="green">Bình thường</Badge>
                    )}
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
