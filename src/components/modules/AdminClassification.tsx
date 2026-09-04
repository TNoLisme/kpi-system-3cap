import { useState, useMemo } from 'react';
import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  Award, Flag, Lock, AlertTriangle, Check, FileText, Download, Snowflake, Users, Building,
  DollarSign, CheckCircle2,
} from 'lucide-react';
import { type Classification } from '@/types';
import {
  FINAL_CLASSIFICATION_DATA, getClassificationLabel, getClassificationColor,
  getCeilingCapReason, CURRENT_USER,
} from '@/data/mockData';
import { useKpiStore } from '@/store/KpiStore';

const ALL_CLASSIFICATIONS: Classification[] = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C', 'D'];

export function AdminClassification() {
  const { showToast } = useToast();
  const { state, dispatch } = useKpiStore();

  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);

  const isFrozen = state.isFrozen;

  // Dữ liệu bảng tổng hợp kết hợp state.tickets và seed để đầy đủ 8 bậc
  const rows = useMemo(() => {
    // Ưu tiên các ticket trong shared store
    const ticketRows = state.tickets.map(t => ({
      id: t.userId,
      name: t.userName,
      unit: t.unit,
      finalScore: t.totalScore,
      roundedScore: t.roundedScore ?? (Math.round(t.totalScore / 5) * 5),
      classification: t.classification ?? ('B1' as Classification),
      flag: t.flagCeiling || !!t.ceiling,
      ceiling: t.ceiling,
      ceilingReasons: t.ceilingReasons,
    }));

    // Bổ sung các bản ghi mẫu khác để đủ toàn trường
    const existingIds = new Set(ticketRows.map(r => r.id));
    const additional = FINAL_CLASSIFICATION_DATA.filter(f => !existingIds.has(f.id)).map(f => ({
      ...f,
      ceiling: f.classification === 'B3' && f.unit === 'Khoa Du lịch' ? ('B3' as Classification) : undefined,
      ceilingReasons: f.flag ? [getCeilingCapReason(f.id)] : undefined,
    }));

    return [...ticketRows, ...additional];
  }, [state.tickets]);

  const handleFreeze = () => {
    setShowConfirm2(false);
    dispatch({
      type: 'FREEZE_PERIOD',
      at: '2026-10-15T17:00:00+07:00',
      actor: CURRENT_USER,
    });
    showToast('success', 'Ban Giám Hiệu đã ban hành và chính thức đóng băng toàn bộ dữ liệu Quý 3/2026');
  };

  const handleDownloadReport = (reportName: string) => {
    showToast('info', `Bản demo chưa sinh tệp thật - ${reportName} được cấu hình theo Biểu mẫu quy chế`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-50">
              <Award size={24} className="text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900">Chốt dữ liệu & Ban hành Xếp loại Toàn trường</h3>
                {isFrozen && (
                  <Badge variant="blue"><Snowflake size={12} className="mr-1 inline" /> ĐÃ ĐÓNG BĂNG</Badge>
                )}
              </div>
              <p className="text-sm text-neutral-500">
                Kỳ đánh giá: {state.period} | Thời hạn: 15/10/2026 | Thẩm quyền: Hội đồng Ban Giám Hiệu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isFrozen ? (
              <button onClick={() => setShowConfirm1(true)} className="btn-primary">
                <Lock size={16} /> Ban hành & Đóng băng Quý 3/2026
              </button>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold flex items-center gap-2">
                <Lock size={14} /> Kỳ đánh giá đã được ban hành chính thức
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 8 Bậc xếp loại cards */}
      <div>
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Phân bố xếp loại 8 bậc toàn trường (Chuẩn Quy chế 2026)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ALL_CLASSIFICATIONS.map(c => {
            const count = rows.filter(d => d.classification === c).length;
            return (
              <Card key={c} className="p-4 text-center border hover:border-primary-300 transition-colors">
                <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold mb-1.5 ${getClassificationColor(c)}`}>
                  {c}
                </div>
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="text-[11px] text-neutral-500">{getClassificationLabel(c).split(' - ')[1]}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Final Classification Table */}
      <Card className="p-6">
        <SectionTitle
          title="Bảng tổng hợp xếp loại nhân sự toàn trường"
          subtitle="Hiển thị điểm thô, điểm làm tròn và kết quả sau khi áp dụng trần B3 / B2"
          icon={<FileText size={18} />}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header" style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>#</th>
                <th className="table-header" style={{ position: 'sticky', left: 40, background: 'white', zIndex: 1 }}>Nhân sự</th>
                <th className="table-header">Đơn vị</th>
                <th className="table-header">Điểm cuối</th>
                <th className="table-header">Điểm sau làm tròn</th>
                <th className="table-header">Xếp loại chính thức</th>
                <th className="table-header">Căn cứ chặn trần</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${row.flag ? 'bg-amber-50/20' : ''}`}>
                  <td className="table-cell text-neutral-400" style={{ position: 'sticky', left: 0, background: 'white' }}>{i + 1}</td>
                  <td className="table-cell font-medium" style={{ position: 'sticky', left: 40, background: 'white' }}>{row.name}</td>
                  <td className="table-cell">{row.unit}</td>
                  <td className="table-cell font-semibold">{row.finalScore.toFixed(1)}</td>
                  <td className="table-cell">
                    <Tooltip content={`Làm tròn chia hết cho 5: ${row.finalScore.toFixed(1)} → ${row.roundedScore}`} maxWidth={250}>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 text-neutral-800 font-semibold text-xs">
                        {row.roundedScore}đ
                      </span>
                    </Tooltip>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getClassificationColor(row.classification)}`}>
                      {getClassificationLabel(row.classification)}
                    </span>
                  </td>
                  <td className="table-cell">
                    {row.ceiling === 'B3' ? (
                      <Tooltip content="Đơn vị có % KPI thực tế < 5% → Khống chế tối đa mức B3" maxWidth={350}>
                        <Badge variant="yellow"><Flag size={12} className="mr-1 inline" /> Trần B3 (KPI đơn vị)</Badge>
                      </Tooltip>
                    ) : row.flag ? (
                      <Tooltip content={row.ceilingReasons?.[0] || getCeilingCapReason(row.id)} maxWidth={350}>
                        <Badge variant="red"><Flag size={12} className="mr-1 inline" /> Cờ B2 (Vi phạm)</Badge>
                      </Tooltip>
                    ) : (
                      <Badge variant="green"><CheckCircle2 size={12} className="mr-1 inline" /> Đạt chuẩn</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4 Thẻ Báo cáo mô phỏng */}
      <div>
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
          Hệ thống Báo cáo & Xuất dữ liệu chính thức
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report 1 */}
          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="p-2.5 rounded-lg bg-red-50 text-danger-600 w-fit mb-3">
                <FileText size={20} />
              </div>
              <h5 className="text-sm font-bold text-neutral-800 mb-1">Phiếu đánh giá cá nhân</h5>
              <p className="text-xs text-neutral-500 mb-2">Đầy đủ chữ ký điện tử, vết phê duyệt 3 cấp và điểm chi tiết</p>
              <div className="text-[11px] text-neutral-400 space-y-0.5 mb-4">
                <p>• Đối tượng: Từng viên chức, người lao động</p>
                <p>• Định dạng: PDF có dấu kiểm định</p>
              </div>
            </div>
            <button
              onClick={() => handleDownloadReport('Phiếu đánh giá cá nhân (PDF)')}
              className="btn-secondary text-xs w-full justify-center"
            >
              <Download size={14} /> Tải bản mô phỏng
            </button>
          </Card>

          {/* Report 2 */}
          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-success-600 w-fit mb-3">
                <Building size={20} />
              </div>
              <h5 className="text-sm font-bold text-neutral-800 mb-1">Báo cáo tổng hợp đơn vị</h5>
              <p className="text-xs text-neutral-500 mb-2">Bảng tổng hợp điểm, phân bố năng lực và mức xếp loại theo Khoa/Phòng</p>
              <div className="text-[11px] text-neutral-400 space-y-0.5 mb-4">
                <p>• Đối tượng: Trưởng đơn vị, Ban Giám Hiệu</p>
                <p>• Định dạng: Excel / PDF</p>
              </div>
            </div>
            <button
              onClick={() => handleDownloadReport('Báo cáo tổng hợp đơn vị (Excel/PDF)')}
              className="btn-secondary text-xs w-full justify-center"
            >
              <Download size={14} /> Tải bản mô phỏng
            </button>
          </Card>

          {/* Report 3 */}
          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="p-2.5 rounded-lg bg-blue-50 text-primary-600 w-fit mb-3">
                <Users size={20} />
              </div>
              <h5 className="text-sm font-bold text-neutral-800 mb-1">Thống kê phân khối toàn trường</h5>
              <p className="text-xs text-neutral-500 mb-2">Thống kê tỷ lệ 8 bậc A1-D, danh sách cờ chặn trần và đơn vị dưới chuẩn</p>
              <div className="text-[11px] text-neutral-400 space-y-0.5 mb-4">
                <p>• Đối tượng: Phòng TCNS, Hội đồng Thi đua</p>
                <p>• Định dạng: Excel đa trang</p>
              </div>
            </div>
            <button
              onClick={() => handleDownloadReport('Thống kê phân khối toàn trường (Excel)')}
              className="btn-secondary text-xs w-full justify-center"
            >
              <Download size={14} /> Tải bản mô phỏng
            </button>
          </Card>

          {/* Report 4 */}
          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 w-fit mb-3">
                <DollarSign size={20} />
              </div>
              <h5 className="text-sm font-bold text-neutral-800 mb-1">Quỹ điểm chi trả thu nhập</h5>
              <p className="text-xs text-neutral-500 mb-2">Quy đổi hệ số lương, quỹ điểm thưởng và thu nhập tăng thêm định kỳ</p>
              <div className="text-[11px] text-neutral-400 space-y-0.5 mb-4">
                <p>• Đối tượng: Phòng Kế hoạch - Tài chính</p>
                <p>• Định dạng: Excel chi trả</p>
              </div>
            </div>
            <button
              onClick={() => handleDownloadReport('Quỹ điểm chi trả thu nhập (Excel)')}
              className="btn-secondary text-xs w-full justify-center"
            >
              <Download size={14} /> Tải bản mô phỏng
            </button>
          </Card>
        </div>
      </div>

      {/* Confirm Modal Layer 1 */}
      <Modal
        open={showConfirm1}
        onClose={() => setShowConfirm1(false)}
        title="Xác nhận Ban hành & Đóng băng Kỳ Quý 3/2026"
        size="md"
        footer={
          <>
            <button onClick={() => setShowConfirm1(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => { setShowConfirm1(false); setShowConfirm2(true); }} className="btn-primary">
              <Check size={16} /> Tiếp tục xác nhận
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 flex items-start gap-3">
            <AlertTriangle size={20} className="text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning-700">Quyết định Ban hành từ Hội đồng BGH</p>
              <p className="text-sm text-warning-600 mt-1">
                Thao tác này sẽ chính thức đóng băng toàn bộ kỳ đánh giá <strong>Quý 3/2026</strong>. Sau khi thực hiện:
              </p>
              <ul className="text-sm text-warning-600 mt-2 space-y-1 list-disc list-inside">
                <li>Toàn bộ điểm và bậc xếp loại cá nhân/đơn vị sẽ bị khóa (Chỉ đọc)</li>
                <li>Không cho phép nộp mới hoặc phê duyệt sửa đổi</li>
                <li>Công bố kết quả đến toàn trường để bắt đầu thời hạn khiếu nại (15 ngày)</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal Layer 2 */}
      <Modal
        open={showConfirm2}
        onClose={() => setShowConfirm2(false)}
        title="Xác nhận lần cuối - Đóng băng vĩnh viễn"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowConfirm2(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleFreeze} className="btn-danger">
              <Lock size={16} /> Xác nhận Đóng băng
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            Hội đồng Ban Giám Hiệu xác nhận chốt toàn bộ số liệu đánh giá Quý 3/2026.
          </p>
        </div>
      </Modal>
    </div>
  );
}
