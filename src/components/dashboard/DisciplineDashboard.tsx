import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { Timeline } from '@/components/charts/Charts';
import { BarChart } from '@/components/charts/Charts';
import { ShieldCheck, AlertTriangle, FileWarning, Clock, MessageSquareWarning } from 'lucide-react';
import { APPROVAL_TIMELINE, TOP_VIOLATIONS, COMPLAINTS } from '@/data/mockData';

export function DisciplineDashboard() {
  const openComplaints = COMPLAINTS.filter(c => c.status === 'mo').length;
  const processingComplaints = COMPLAINTS.filter(c => c.status === 'dang-xu-ly').length;
  const closedComplaints = COMPLAINTS.filter(c => c.status === 'da-dong').length;

  const topViolationData = TOP_VIOLATIONS.map(v => ({
    label: v.code,
    value: v.count,
    color: v.category === 'hanh-chinh' ? '#3b82f6' : v.category === 'chuyen-mon' ? '#22c55e' : v.category === 'thai-do' ? '#f59e0b' : '#8b5cf6',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Clock size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Đơn vị chậm duyệt</p>
          <p className="text-3xl font-bold text-neutral-900">{APPROVAL_TIMELINE.filter(t => t.status !== 'on-track').length}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-warning-50">
              <MessageSquareWarning size={20} className="text-warning-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Khiếu nại đang mở</p>
          <p className="text-3xl font-bold text-warning-600">{openComplaints}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <ShieldCheck size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Khiếu nại đang xử lý</p>
          <p className="text-3xl font-bold text-primary-600">{processingComplaints}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-50">
              <FileWarning size={20} className="text-success-600" />
            </div>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Khiếu nại đã đóng</p>
          <p className="text-3xl font-bold text-success-600">{closedComplaints}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card className="p-6">
          <SectionTitle title="Tiến độ duyệt phiếu các đơn vị" subtitle="Theo dõi sát hạn duyệt" icon={<Clock size={18} />} />
          <div className="pt-4">
            <Timeline items={APPROVAL_TIMELINE} />
          </div>
        </Card>

        {/* Top Violations */}
        <Card className="p-6">
          <SectionTitle title="Top lỗi vi phạm" subtitle="Mã lỗi xảy ra nhiều nhất trong kỳ" icon={<AlertTriangle size={18} />} />
          <div className="pt-4">
            <BarChart data={topViolationData} height={240} horizontal />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary-500" />
              <span>Hành chính</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-success-500" />
              <span>Chuyên môn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-warning-500" />
              <span>Thái độ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#8b5cf6' }} />
              <span>Phối hợp</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Complaints Summary */}
      <Card className="p-6">
        <SectionTitle title="Thống kê khiếu nại" subtitle="Tổng hợp đơn khiếu nại toàn trường" icon={<MessageSquareWarning size={18} />} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header" style={{ position: 'sticky', left: 0, background: 'white' }}>Mã</th>
                <th className="table-header">Người khiếu nại</th>
                <th className="table-header">Đơn vị</th>
                <th className="table-header">Loại</th>
                <th className="table-header">Ngày nộp</th>
                <th className="table-header">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {COMPLAINTS.map(c => (
                <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="table-cell font-medium" style={{ position: 'sticky', left: 0, background: 'white' }}>{c.id}</td>
                  <td className="table-cell">{c.complainant}</td>
                  <td className="table-cell">{c.unit}</td>
                  <td className="table-cell">{c.type}</td>
                  <td className="table-cell">{c.submittedDate}</td>
                  <td className="table-cell">
                    <Badge variant={c.status === 'mo' ? 'yellow' : c.status === 'dang-xu-ly' ? 'blue' : 'green'}>
                      {c.status === 'mo' ? 'Đang mở' : c.status === 'dang-xu-ly' ? 'Đang xử lý' : 'Đã đóng'}
                    </Badge>
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
