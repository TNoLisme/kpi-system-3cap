import { useState } from 'react';
import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  Award, Flag, Lock, AlertTriangle, Check, FileText, ShieldCheck,
  Download, FileSpreadsheet, FileDown, Snowflake,
} from 'lucide-react';
import { type Classification } from '@/types';
import {
  FINAL_CLASSIFICATION_DATA, getClassificationLabel, getClassificationColor,
  getCeilingCapReason,
} from '@/data/mockData';

export function AdminClassification() {
  const { showToast } = useToast();
  const [data, setData] = useState(FINAL_CLASSIFICATION_DATA);
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleFreeze = () => {
    setShowConfirm2(false);
    setIsFrozen(true);
    showToast('success', 'Đã ban hành và đóng băng dữ liệu kỳ Q3/2026 - Toàn bộ dữ liệu chuyển sang chỉ đọc');
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    setShowExportMenu(false);
    showToast('info', `Đang trích xuất dữ liệu ${format === 'excel' ? 'Excel' : 'PDF'}...`);
    setTimeout(() => {
      showToast('success', `Đã tải xuống file Bao_cao_xep_loai_Q3_2026.${format === 'excel' ? 'xlsx' : 'pdf'}`);
    }, 1500);
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
              <h3 className="text-lg font-semibold text-neutral-900">Chốt dữ liệu & Xếp loại toàn trường</h3>
              <p className="text-sm text-neutral-500">
                Kỳ đánh giá: Q3/2026 | Trạng thái: {isFrozen ? (
                  <span className="inline-flex items-center gap-1 text-primary-600 font-medium">
                    <Snowflake size={14} /> Đã đóng băng (Chỉ đọc)
                  </span>
                ) : 'Đang mở'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isFrozen && (
              <Badge variant="blue"><Lock size={14} /> Đã đóng băng kỳ đánh giá</Badge>
            )}
            {/* Export Button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn-secondary"
              >
                <Download size={16} /> Xuất báo cáo
                <FileDown size={12} className="text-neutral-400" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 animate-scale-in">
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-primary-50 transition-colors"
                  >
                    <FileSpreadsheet size={16} className="text-success-600" /> Xuất Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-primary-50 transition-colors"
                  >
                    <FileText size={16} className="text-danger-600" /> Xuất PDF (.pdf)
                  </button>
                </div>
              )}
            </div>
            {!isFrozen && (
              <button onClick={() => setShowConfirm1(true)} className="btn-primary">
                <Lock size={16} /> Ban hành & Đóng băng
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(['A1', 'A2', 'B1', 'B2', 'C', 'D'] as Classification[]).map(c => {
          const count = data.filter(d => d.classification === c).length;
          return (
            <Card key={c} className="p-4 text-center">
              <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold mb-2 ${getClassificationColor(c)}`}>
                {c}
              </div>
              <p className="text-2xl font-bold text-neutral-900">{count}</p>
              <p className="text-xs text-neutral-500">{getClassificationLabel(c).split(' - ')[1]}</p>
            </Card>
          );
        })}
      </div>

      {/* Final Classification Table */}
      <Card className="p-6">
        <SectionTitle
          title="Bảng tổng hợp điểm cuối cùng"
          subtitle="Tổng hợp điểm, làm tròn, và xếp loại - Cờ chặn trần được highlight"
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
                <th className="table-header">Xếp loại cuối</th>
                <th className="table-header">Cờ chặn trần</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${row.flag ? 'bg-danger-50/30' : ''}`}>
                  <td className="table-cell text-neutral-400" style={{ position: 'sticky', left: 0, background: 'white' }}>{i + 1}</td>
                  <td className="table-cell font-medium" style={{ position: 'sticky', left: 40, background: 'white' }}>{row.name}</td>
                  <td className="table-cell">{row.unit}</td>
                  <td className="table-cell font-semibold">{row.finalScore.toFixed(1)}</td>
                  <td className="table-cell">
                    <Tooltip content={`Làm tròn đến số chia hết cho 5: ${row.finalScore.toFixed(1)} → ${row.roundedScore}`} maxWidth={250}>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-semibold">
                        {row.roundedScore}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-bold ${getClassificationColor(row.classification)}`}>
                      {getClassificationLabel(row.classification)}
                    </span>
                  </td>
                  <td className="table-cell">
                    {row.flag ? (
                      <Tooltip content={getCeilingCapReason(row.id)} maxWidth={350} side="bottom">
                        <Badge variant="red"><Flag size={12} /> Bị chặn trần</Badge>
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

        <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-start gap-2">
          <AlertTriangle size={16} className="text-warning-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-neutral-600">
            <p className="font-medium text-neutral-700">Quy tắc làm tròn:</p>
            <p className="mt-0.5">Điểm được tự động làm tròn đến số chia hết cho 5. VD: 82.4 → 80; 82.5 → 85.</p>
            <p className="mt-1 font-medium text-neutral-700">Cờ chặn trần xếp loại:</p>
            <p className="mt-0.5">Nhân sự vướng lỗi vi phạm bị gắn cờ - Xếp loại tối đa không vượt quá B2 (Tốt). Hover vào badge để xem căn cứ chi tiết.</p>
          </div>
        </div>

        {isFrozen && (
          <div className="mt-4 p-4 rounded-lg bg-primary-50 border border-primary-200 flex items-center gap-3 animate-fade-in">
            <Snowflake size={20} className="text-primary-600" />
            <div>
              <p className="text-sm font-semibold text-primary-700">Dữ liệu kỳ Q3/2026 đã được đóng băng</p>
              <p className="text-xs text-primary-600 mt-0.5">Toàn bộ điểm, xếp loại đã được khóa ở chế độ chỉ đọc. Không thể chỉnh sửa, thêm, hoặc duyệt mới.</p>
            </div>
          </div>
        )}
      </Card>

      {/* Confirm Modal Layer 1 */}
      <Modal
        open={showConfirm1}
        onClose={() => setShowConfirm1(false)}
        title="Xác nhận ban hành dữ liệu"
        size="md"
        footer={
          <>
            <button onClick={() => setShowConfirm1(false)} className="btn-secondary">Hủy</button>
            <button onClick={() => { setShowConfirm1(false); setShowConfirm2(true); }} className="btn-primary">
              <Check size={16} /> Tiếp tục
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 flex items-start gap-3">
            <AlertTriangle size={20} className="text-warning-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-warning-700">Cảnh báo thao tác quan trọng</p>
              <p className="text-sm text-warning-600 mt-1">
                Bạn có chắc chắn muốn đóng băng kỳ Quý 3/2026? Hành động này sẽ:
              </p>
              <ul className="text-sm text-warning-600 mt-2 space-y-1 list-disc list-inside">
                <li>Khóa toàn bộ dữ liệu đánh giá kỳ Q3/2026</li>
                <li>Không cho phép chỉnh sửa điểm, xếp loại</li>
                <li>Chuyển toàn bộ giao diện sang trạng thái Chỉ đọc (Read-only)</li>
                <li>Chính thức công bố kết quả đến toàn bộ nhân sự</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal Layer 2 */}
      <Modal
        open={showConfirm2}
        onClose={() => setShowConfirm2(false)}
        title="Xác nhận lần cuối - Đóng băng dữ liệu"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowConfirm2(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleFreeze} className="btn-danger">
              <Lock size={16} /> Đóng băng vĩnh viễn
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 flex items-start gap-3">
            <ShieldCheck size={20} className="text-danger-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-danger-700">Xác nhận lần cuối</p>
              <p className="text-sm text-danger-600 mt-1">
                Sau khi đóng băng, dữ liệu không thể hoàn tác. Vui lòng kiểm tra kỹ trước khi xác nhận.
              </p>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Tổng số nhân sự: {data.length} | Số bị cờ chặn trần: {data.filter(d => d.flag).length}
          </p>
        </div>
      </Modal>
    </div>
  );
}
