import { useState, useMemo } from 'react';
import { Card, SectionTitle, Badge, Select } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  MessageSquareWarning, Upload, Send, FileText, Clock, CheckCircle2,
  AlertCircle, Lock, Gavel, Plus, Check,
} from 'lucide-react';
import { type Complaint, type ComplaintStatus, type ComplaintResolution } from '@/types';
import { COMPLAINT_TYPES, CURRENT_USER, DEMO_CURRENT_DATE } from '@/data/mockData';
import { useKpiStore } from '@/store/KpiStore';

interface Props {
  isUserComplaint?: boolean;
}

export function ComplaintModule({ isUserComplaint = false }: Props) {
  const { showToast } = useToast();
  const { state, dispatch } = useKpiStore();

  const [showForm, setShowForm] = useState(false);
  const [complaintType, setComplaintType] = useState('');
  const [complaintReason, setComplaintReason] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [processingComplaint, setProcessingComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolutionType, setResolutionType] = useState<'reject' | 'adjust'>('adjust');
  const [scoreAdjustment, setScoreAdjustment] = useState(5);

  // Mốc thời hạn khiếu nại: ngày 15 của tháng công bố kết quả (15/10/2026)
  const deadline = new Date('2026-10-15T23:59:59');
  const currentDate = new Date(DEMO_CURRENT_DATE || '2026-10-10');
  const remainingDays = Math.max(0, Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
  const canComplain = remainingDays > 0;

  // Lọc danh sách: nếu là màn cá nhân thì chỉ hiện khiếu nại của chính mình
  const complaints = useMemo(() => {
    if (isUserComplaint) {
      return state.complaints.filter(c => c.complainant === CURRENT_USER.name || c.userId === CURRENT_USER.id);
    }
    return state.complaints;
  }, [state.complaints, isUserComplaint]);

  const handleSubmit = () => {
    if (!complaintType || !complaintReason.trim()) {
      showToast('error', 'Vui lòng chọn loại khiếu nại và nêu rõ lý do');
      return;
    }
    if (!evidenceName.trim()) {
      showToast('error', 'Vui lòng đính kèm tên file hoặc liên kết tài liệu minh chứng');
      return;
    }

    const newComplaint: Complaint = {
      id: `c00${state.complaints.length + 1}`,
      userId: CURRENT_USER.id,
      ticketId: 't001',
      complainant: CURRENT_USER.name,
      unit: CURRENT_USER.unit,
      type: complaintType,
      reason: complaintReason.trim(),
      evidenceName: evidenceName.trim(),
      status: 'mo',
      submittedDate: DEMO_CURRENT_DATE || '2026-10-10',
      responseDueDate: '2026-10-12', // SLA 02 ngày làm việc
      assignedTo: null,
    };

    dispatch({ type: 'CREATE_COMPLAINT', complaint: newComplaint });
    showToast('success', 'Đã nộp đơn khiếu nại thành công - Đơn đã chuyển đến Phòng Thanh tra (SLA: 02 ngày)');
    setShowForm(false);
    setComplaintType('');
    setComplaintReason('');
    setEvidenceName('');
  };

  const handleStartProcess = (c: Complaint) => {
    dispatch({
      type: 'START_COMPLAINT',
      complaintId: c.id,
      actor: CURRENT_USER,
    });
    setProcessingComplaint(c);
  };

  const handleResolveComplaint = () => {
    if (!resolution.trim()) {
      showToast('error', 'Vui lòng nhập Kết luận thanh tra Cấp 1');
      return;
    }
    if (!processingComplaint) return;

    const res: ComplaintResolution = {
      level: 1,
      decision: resolutionType,
      conclusion: resolution.trim(),
      scoreAdjustment: resolutionType === 'adjust' ? Math.max(1, scoreAdjustment) : 0,
      resolvedAt: '2026-10-12T14:00:00Z',
    };

    dispatch({
      type: 'RESOLVE_COMPLAINT',
      complaintId: processingComplaint.id,
      resolution: res,
      actor: CURRENT_USER,
    });

    if (resolutionType === 'adjust') {
      showToast('success', `Đã ban hành quyết định Cấp 1: Chấp thuận điều chỉnh +${scoreAdjustment} điểm cho ${processingComplaint.complainant}. Điểm số và xếp loại đã được cập nhật.`);
    } else {
      showToast('info', `Đã ban hành quyết định Cấp 1: Bác đơn khiếu nại của ${processingComplaint.complainant}. Giữ nguyên kết quả.`);
    }

    setProcessingComplaint(null);
    setResolution('');
    setResolutionType('adjust');
    setScoreAdjustment(5);
  };

  const typeOptions = COMPLAINT_TYPES.map(t => ({ value: t, label: t }));

  const statusConfig: Record<ComplaintStatus, { label: string; variant: 'yellow' | 'blue' | 'green'; icon: React.ReactNode }> = {
    'mo': { label: 'Đang mở (Chờ xử lý)', variant: 'yellow' as const, icon: <Clock size={14} /> },
    'dang-xu-ly': { label: 'Đang xử lý (Thanh tra)', variant: 'blue' as const, icon: <AlertCircle size={14} /> },
    'da-dong': { label: 'Đã có quyết định', variant: 'green' as const, icon: <CheckCircle2 size={14} /> },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning-50">
              <MessageSquareWarning size={24} className="text-warning-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {isUserComplaint ? 'Cổng Khiếu nại Cá nhân' : 'Quản lý Khiếu nại Đánh giá (Thanh tra Cấp 1)'}
                </h3>
                {isUserComplaint && (
                  <Badge variant={canComplain ? 'yellow' : 'gray'}>
                    {canComplain ? `Còn ${remainingDays} ngày` : 'Đã hết hạn'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-neutral-500 mt-0.5">
                {isUserComplaint ? (
                  <span>
                    Thời hạn nộp khiếu nại: <strong>trước ngày 15 của tháng công bố kết quả</strong> (Hạn chót: 15/10/2026)
                  </span>
                ) : (
                  <span>SLA tiếp nhận và xử lý giải quyết bước đầu: <strong>Phản hồi trong 02 ngày làm việc</strong></span>
                )}
              </p>
            </div>
          </div>
          {isUserComplaint && (
            canComplain ? (
              <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
                <Plus size={16} /> Tạo đơn khiếu nại
              </button>
            ) : (
              <Badge variant="gray"><Lock size={14} /> Đã hết hạn khiếu nại</Badge>
            )
          )}
        </div>
      </Card>

      {/* Stats for Inspectors */}
      {!isUserComplaint && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning-50">
                <Clock size={20} className="text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{complaints.filter(c => c.status === 'mo').length}</p>
                <p className="text-xs text-neutral-500">Đơn chờ thụ lý</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary-50">
                <AlertCircle size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{complaints.filter(c => c.status === 'dang-xu-ly').length}</p>
                <p className="text-xs text-neutral-500">Đang xác minh (SLA 02 ngày)</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-success-50">
                <CheckCircle2 size={20} className="text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{complaints.filter(c => c.status === 'da-dong').length}</p>
                <p className="text-xs text-neutral-500">Đã giải quyết xong</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Complaints List */}
      <Card className="p-6">
        <SectionTitle
          title={isUserComplaint ? "Danh sách đơn khiếu nại của bạn" : "Danh sách đơn khiếu nại toàn trường"}
          subtitle={`${complaints.length} đơn được ghi nhận trên hệ thống`}
          icon={<MessageSquareWarning size={18} />}
        />
        <div className="space-y-3 pt-2">
          {complaints.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-sm">
              Chưa có đơn khiếu nại nào được ghi nhận.
            </div>
          ) : (
            complaints.map(c => (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-shadow ${c.status === 'mo' ? 'border-warning-200 bg-warning-50/20' : c.status === 'dang-xu-ly' ? 'border-primary-200 bg-primary-50/20' : 'border-neutral-200 bg-white'} hover:shadow-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-neutral-100 flex-shrink-0 text-neutral-600">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-neutral-900">{c.id}</span>
                        <Badge variant={statusConfig[c.status].variant}>
                          {statusConfig[c.status].label}
                        </Badge>
                        {c.responseDueDate && c.status !== 'da-dong' && (
                          <Badge variant="blue">
                            <Clock size={12} className="mr-1 inline" /> Hạn phản hồi: {c.responseDueDate}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-neutral-800">{c.type}</p>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{c.reason}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-neutral-500">
                        <span>Người nộp: <strong className="text-neutral-700">{c.complainant}</strong></span>
                        <span>Đơn vị: {c.unit}</span>
                        <span>Ngày gửi: {c.submittedDate}</span>
                        {c.assignedTo && <span>Cán bộ thụ lý: <strong>{c.assignedTo}</strong></span>}
                      </div>

                      {c.evidenceName && (
                        <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded bg-neutral-100 text-xs text-primary-700 font-medium">
                          <Upload size={12} />
                          <span>Minh chứng đính kèm: {c.evidenceName}</span>
                        </div>
                      )}

                      {/* Resolution details */}
                      {c.status === 'da-dong' && c.resolution && (
                        <div className="mt-3 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                              Quyết định giải quyết Cấp 1 (Thanh tra)
                            </span>
                            <Badge variant={c.resolutionType === 'adjust' ? 'green' : 'red'}>
                              {c.resolutionType === 'adjust' ? `Chấp thuận (+${c.scoreAdjustment}đ)` : 'Bác đơn'}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                            {c.resolution}
                          </p>
                          {c.resolvedDate && (
                            <p className="text-[11px] text-neutral-400 mt-1.5">
                              Thời điểm ban hành quyết định: {new Date(c.resolvedDate).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for Inspector */}
                  {!isUserComplaint && c.status !== 'da-dong' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {c.status === 'mo' ? (
                        <button
                          onClick={() => handleStartProcess(c)}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Gavel size={14} /> Thụ lý & Xử lý
                        </button>
                      ) : (
                        <button
                          onClick={() => setProcessingComplaint(c)}
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Gavel size={14} /> Ra quyết định Cấp 1
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modal Tạo đơn khiếu nại */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Tạo đơn khiếu nại kết quả đánh giá"
        size="md"
        footer={
          <>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} className="btn-primary">
              <Send size={16} /> Gửi khiếu nại
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <span>Thời hạn khiếu nại kết quả: <strong>trước ngày 15 của tháng công bố</strong>. Đơn sẽ được Phòng Thanh tra thụ lý và có phản hồi trong vòng 02 ngày làm việc.</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Loại khiếu nại <span className="text-danger-500">*</span>
            </label>
            <Select
              value={complaintType}
              onChange={setComplaintType}
              options={typeOptions}
              placeholder="Chọn nội dung khiếu nại..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nội dung & Lý do khiếu nại chi tiết <span className="text-danger-500">*</span>
            </label>
            <textarea
              rows={4}
              value={complaintReason}
              onChange={e => setComplaintReason(e.target.value)}
              placeholder="Nêu rõ sản phẩm, điểm số hoặc lỗi vi phạm bạn đề nghị xem xét lại..."
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tên file hoặc liên kết tài liệu minh chứng <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={evidenceName}
              onChange={e => setEvidenceName(e.target.value)}
              placeholder="Ví dụ: Minh_chung_xac_nhan_SP04.pdf hoặc link bài báo..."
              className="input w-full"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Xử lý Thanh tra Cấp 1 */}
      <Modal
        open={processingComplaint !== null}
        onClose={() => setProcessingComplaint(null)}
        title="Ban hành Quyết định Giải quyết Khiếu nại (Cấp 1)"
        size="md"
        footer={
          <>
            <button onClick={() => setProcessingComplaint(null)} className="btn-secondary">Hủy</button>
            <button onClick={handleResolveComplaint} className="btn-primary">
              <Check size={16} /> Ban hành quyết định
            </button>
          </>
        }
      >
        {processingComplaint && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-neutral-500">Đơn khiếu nại</p>
                  <p className="text-sm font-bold text-neutral-800">{processingComplaint.id} - {processingComplaint.complainant} ({processingComplaint.unit})</p>
                </div>
                <Badge variant="blue">
                  <Clock size={12} className="mr-1 inline" /> SLA: 02 ngày làm việc
                </Badge>
              </div>
              <p className="text-xs text-neutral-600 mt-2"><strong>Nội dung:</strong> {processingComplaint.reason}</p>
              {processingComplaint.evidenceName && (
                <p className="text-xs text-primary-600 mt-1"><strong>Minh chứng:</strong> {processingComplaint.evidenceName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Hình thức giải quyết <span className="text-danger-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${resolutionType === 'adjust' ? 'border-primary-500 bg-primary-50/50 text-primary-900 font-semibold' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                  <input
                    type="radio"
                    name="resType"
                    checked={resolutionType === 'adjust'}
                    onChange={() => setResolutionType('adjust')}
                    className="text-primary-600"
                  />
                  <span>Chấp thuận & Điều chỉnh điểm</span>
                </label>

                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${resolutionType === 'reject' ? 'border-danger-500 bg-danger-50/50 text-danger-900 font-semibold' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                  <input
                    type="radio"
                    name="resType"
                    checked={resolutionType === 'reject'}
                    onChange={() => setResolutionType('reject')}
                    className="text-danger-600"
                  />
                  <span>Bác đơn khiếu nại</span>
                </label>
              </div>
            </div>

            {resolutionType === 'adjust' && (
              <div className="p-3.5 rounded-lg bg-success-50 border border-success-200 animate-slide-up">
                <label className="block text-xs font-semibold text-success-800 mb-1.5">
                  Số điểm điều chỉnh bổ sung (Cộng thêm)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={scoreAdjustment}
                    onChange={e => setScoreAdjustment(Math.max(1, parseInt(e.target.value) || 0))}
                    className="input w-24 text-center font-bold text-success-700"
                  />
                  <span className="text-xs text-success-700 font-medium">điểm (Tự động cập nhật tổng điểm và tính lại bậc xếp loại)</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
                Kết luận thanh tra Cấp 1 <span className="text-danger-500">*</span>
              </label>
              <textarea
                rows={3}
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                placeholder="Căn cứ vào kết quả thẩm tra tài liệu minh chứng bổ sung, Phòng Thanh tra kết luận..."
                className="input w-full"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
