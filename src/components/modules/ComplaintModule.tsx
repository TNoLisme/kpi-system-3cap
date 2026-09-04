import { useState } from 'react';
import { Card, SectionTitle, Badge, Select } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  MessageSquareWarning, Upload, Send, FileText, Clock, CheckCircle2,
  AlertCircle, Lock, Gavel, X, Plus,
} from 'lucide-react';
import { type Complaint, type ComplaintStatus } from '@/types';
import { COMPLAINTS, COMPLAINT_TYPES } from '@/data/mockData';

interface Props {
  isUserComplaint?: boolean;
}

export function ComplaintModule({ isUserComplaint = false }: Props) {
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [complaintType, setComplaintType] = useState('');
  const [complaintReason, setComplaintReason] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [processingComplaint, setProcessingComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolutionType, setResolutionType] = useState<'reject' | 'adjust'>('reject');
  const [scoreAdjustment, setScoreAdjustment] = useState(0);

  const currentDate = new Date('2026-09-03');
  const deadline = new Date('2026-10-15');
  const canComplain = currentDate <= deadline;

  const handleSubmit = () => {
    if (!complaintType || !complaintReason.trim()) {
      showToast('error', 'Vui lòng chọn loại khiếu nại và nhập lý do');
      return;
    }
    const newComplaint: Complaint = {
      id: `c${Date.now()}`,
      complainant: 'Nguyễn Văn An',
      unit: 'Phòng Đào tạo',
      type: complaintType,
      reason: complaintReason,
      evidenceName: evidenceName || null,
      status: 'mo',
      submittedDate: '2026-09-03',
      assignedTo: null,
    };
    setComplaints(prev => [newComplaint, ...prev]);
    showToast('success', 'Đã gửi khiếu nại đến Phòng Thanh tra');
    setShowForm(false);
    setComplaintType('');
    setComplaintReason('');
    setEvidenceName('');
  };

  const handleProcessComplaint = () => {
    if (!resolution.trim()) {
      showToast('error', 'Vui lòng nhập kết luận thanh tra');
      return;
    }
    if (!processingComplaint) return;

    setComplaints(prev => prev.map(c =>
      c.id === processingComplaint.id
        ? {
          ...c,
          status: 'da-dong',
          resolution,
          resolutionType,
          scoreAdjustment: resolutionType === 'adjust' ? scoreAdjustment : 0,
          resolvedDate: '2026-09-04',
          assignedTo: 'Phòng Thanh tra',
        }
        : c
    ));

    if (resolutionType === 'adjust') {
      showToast('success', `Đã chấp thuận điều chỉnh +${scoreAdjustment} điểm cho ${processingComplaint.complainant} - Đơn khiếu nại đã đóng`);
    } else {
      showToast('info', `Đã bác khiếu nại của ${processingComplaint.complainant} - Đơn khiếu nại đã đóng`);
    }

    setProcessingComplaint(null);
    setResolution('');
    setResolutionType('reject');
    setScoreAdjustment(0);
  };

  const typeOptions = COMPLAINT_TYPES.map(t => ({ value: t, label: t }));

  const statusConfig: Record<ComplaintStatus, { label: string; variant: 'yellow' | 'blue' | 'green'; icon: React.ReactNode }> = {
    'mo': { label: 'Đang mở', variant: 'yellow' as const, icon: <Clock size={14} /> },
    'dang-xu-ly': { label: 'Đang xử lý', variant: 'blue' as const, icon: <AlertCircle size={14} /> },
    'da-dong': { label: 'Đã đóng', variant: 'green' as const, icon: <CheckCircle2 size={14} /> },
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
              <h3 className="text-lg font-semibold text-neutral-900">Khiếu nại trực tuyến</h3>
              <p className="text-sm text-neutral-500">
                {isUserComplaint
                  ? `Hạn nộp khiếu nại: 15/10/2026 | ${canComplain ? 'Còn thời gian khiếu nại' : 'Đã hết hạn khiếu nại'}`
                  : 'Quản lý đơn khiếu nại từ nhân sự toàn trường'}
              </p>
            </div>
          </div>
          {isUserComplaint && (
            canComplain ? (
              <button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus size={16} /> Tạo khiếu nại
              </button>
            ) : (
              <Badge variant="gray"><Lock size={14} /> Đã hết hạn khiếu nại</Badge>
            )
          )}
        </div>
      </Card>

      {/* Stats */}
      {!isUserComplaint && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-warning-50">
                <Clock size={20} className="text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{complaints.filter(c => c.status === 'mo').length}</p>
                <p className="text-sm text-neutral-500">Đang mở</p>
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
                <p className="text-sm text-neutral-500">Đang xử lý</p>
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
                <p className="text-sm text-neutral-500">Đã đóng</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Complaints List */}
      <Card className="p-6">
        <SectionTitle
          title={isUserComplaint ? "Khiếu nại của tôi" : "Danh sách khiếu nại"}
          subtitle="Tổng hợp đơn khiếu nại"
          icon={<MessageSquareWarning size={18} />}
        />
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c.id} className={`p-4 rounded-xl border transition-shadow ${c.status === 'mo' ? 'border-warning-200 bg-warning-50/30' : c.status === 'dang-xu-ly' ? 'border-primary-200 bg-primary-50/30' : 'border-neutral-200'} hover:shadow-sm`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-neutral-100 flex-shrink-0">
                    <FileText size={18} className="text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-neutral-800">{c.id}</span>
                      <Badge variant={statusConfig[c.status].variant}>
                        {statusConfig[c.status].icon} {statusConfig[c.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-neutral-700">{c.type}</p>
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{c.reason}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                      <span>Người nộp: {c.complainant}</span>
                      <span>Đơn vị: {c.unit}</span>
                      <span>Ngày: {c.submittedDate}</span>
                      {c.assignedTo && <span>Phụ trách: {c.assignedTo}</span>}
                    </div>
                    {c.evidenceName && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-primary-600">
                        <Upload size={12} />
                        <span>{c.evidenceName}</span>
                      </div>
                    )}
                    {/* Resolution display for closed complaints */}
                    {c.status === 'da-dong' && c.resolution && (
                      <div className="mt-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                        <p className="text-xs font-semibold text-neutral-700 mb-1">Kết luận thanh tra:</p>
                        <p className="text-xs text-neutral-600">{c.resolution}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={c.resolutionType === 'adjust' ? 'green' : 'red'}>
                            {c.resolutionType === 'adjust' ? `Chấp thuận (+${c.scoreAdjustment}đ)` : 'Bác khiếu nại'}
                          </Badge>
                          {c.resolvedDate && <span className="text-xs text-neutral-400">Ngày ban hành: {c.resolvedDate}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Process button for Thanh Tra */}
                {!isUserComplaint && c.status === 'mo' && (
                  <button
                    onClick={() => setProcessingComplaint(c)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors flex-shrink-0"
                  >
                    <Gavel size={14} /> Xử lý đơn
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Complaint Form Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Tạo khiếu nại"
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
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Loại khiếu nại <span className="text-danger-500">*</span></label>
            <Select
              value={complaintType}
              onChange={setComplaintType}
              options={typeOptions}
              placeholder="Chọn loại khiếu nại..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Lý do chi tiết <span className="text-danger-500">*</span></label>
            <textarea
              value={complaintReason}
              onChange={e => setComplaintReason(e.target.value)}
              rows={5}
              placeholder="Nhập lý do khiếu nại chi tiết..."
              className="input resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Đính kèm minh chứng</label>
            <button
              onClick={() => setEvidenceName('Minh_chung_' + Date.now() + '.pdf')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-sm text-neutral-600 w-full"
            >
              <Upload size={16} />
              {evidenceName || 'Tải lên file minh chứng (PDF, Docs, Image)'}
            </button>
          </div>
          <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 flex items-start gap-2">
            <AlertCircle size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary-700">
              Khiếu nại sẽ được gửi trực tiếp đến Phòng Thanh tra để xử lý.
              Hạn nộp khiếu nại: 15/10/2026 (15 ngày của tháng đầu quý sau).
            </p>
          </div>
        </div>
      </Modal>

      {/* Process Complaint Modal - Biên bản xử lý khiếu nại */}
      <Modal
        open={processingComplaint !== null}
        onClose={() => setProcessingComplaint(null)}
        title="Biên bản xử lý khiếu nại"
        size="lg"
        footer={
          <>
            <button onClick={() => setProcessingComplaint(null)} className="btn-secondary">Hủy</button>
            <button onClick={handleProcessComplaint} className="btn-primary">
              <Gavel size={16} /> Ban hành quyết định
            </button>
          </>
        }
      >
        {processingComplaint && (
          <div className="space-y-4">
            {/* Summary of complaint */}
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Tóm tắt nội dung khiếu nại</p>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-xs text-neutral-500 w-24 flex-shrink-0">Mã đơn:</span>
                  <span className="text-sm font-medium text-neutral-800">{processingComplaint.id}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-neutral-500 w-24 flex-shrink-0">Người nộp:</span>
                  <span className="text-sm text-neutral-700">{processingComplaint.complainant} ({processingComplaint.unit})</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-neutral-500 w-24 flex-shrink-0">Loại:</span>
                  <span className="text-sm text-neutral-700">{processingComplaint.type}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-neutral-500 w-24 flex-shrink-0">Nội dung:</span>
                  <span className="text-sm text-neutral-600">{processingComplaint.reason}</span>
                </div>
                {processingComplaint.evidenceName && (
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-24 flex-shrink-0">Minh chứng:</span>
                    <span className="text-sm text-primary-600">{processingComplaint.evidenceName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Kết luận thanh tra & Giải trình <span className="text-danger-500">*</span>
              </label>
              <textarea
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                rows={4}
                placeholder="Nhập kết luận thanh tra và giải trình chi tiết..."
                className="input resize-none"
              />
            </div>

            {/* Resolution type radio */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Quyết định</label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${resolutionType === 'reject' ? 'border-danger-400 bg-danger-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                  <input
                    type="radio"
                    name="resolution"
                    checked={resolutionType === 'reject'}
                    onChange={() => setResolutionType('reject')}
                    className="w-4 h-4 text-danger-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Bác khiếu nại</p>
                    <p className="text-xs text-neutral-500">Không chấp nhận nội dung khiếu nại, giữ nguyên kết quả đánh giá</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${resolutionType === 'adjust' ? 'border-success-400 bg-success-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                  <input
                    type="radio"
                    name="resolution"
                    checked={resolutionType === 'adjust'}
                    onChange={() => setResolutionType('adjust')}
                    className="w-4 h-4 text-success-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">Chấp thuận điều chỉnh điểm</p>
                    <p className="text-xs text-neutral-500">Chấp nhận khiếu nại, điều chỉnh điểm cho nhân sự</p>
                  </div>
                  {resolutionType === 'adjust' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={scoreAdjustment}
                        onChange={e => setScoreAdjustment(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="input w-20 text-center font-semibold"
                        placeholder="+5"
                      />
                      <span className="text-sm text-neutral-500">điểm</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 flex items-start gap-2">
              <AlertCircle size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary-700">
                Khi ban hành quyết định, trạng thái đơn sẽ chuyển thành "Đã đóng",
                {resolutionType === 'adjust'
                  ? ` điểm của ${processingComplaint.complainant} sẽ được cộng thêm ${scoreAdjustment} điểm và lưu vết.`
                  : ' kết quả đánh giá được giữ nguyên.'}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
