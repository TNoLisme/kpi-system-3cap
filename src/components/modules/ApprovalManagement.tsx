import { useState, useMemo } from 'react';
import { Card, SectionTitle, Badge, Select } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { EvidencePreview } from '@/components/ui/EvidencePreview';
import {
  CheckSquare, FileText, Check, X, Flag, AlertTriangle, Upload,
  Link as LinkIcon, Eye, ArrowRight, User, Building2, CheckCheck,
} from 'lucide-react';
import { type AssessmentTicket, type ProductItem, type TicketStatus } from '@/types';
import {
  PENDING_TICKETS, PRODUCT_CATEGORIES, VIOLATION_CODES, MY_PRODUCTS,
  getClassificationLabel, getClassificationColor, predictClassification,
} from '@/data/mockData';

export function ApprovalManagement() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<AssessmentTicket[]>(PENDING_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<AssessmentTicket | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [violationCode, setViolationCode] = useState<string>('');
  const [violationDesc, setViolationDesc] = useState('');
  const [violationEvidence, setViolationEvidence] = useState('');
  const [ctstScore, setCtstScore] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Dynamic recalculation for selected ticket
  const dynamicScore = useMemo(() => {
    if (!selectedTicket) return 0;
    const productScore = MY_PRODUCTS.reduce((sum, p) => sum + (p.maxScore * p.contribution) / 100, 0);
    return Math.max(0, Math.round(productScore + ctstScore - selectedTicket.violations.length * 2));
  }, [selectedTicket, ctstScore]);

  const dynamicClassification = selectedTicket ? predictClassification(dynamicScore) : null;

  const handleApprove = () => {
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t =>
      t.id === selectedTicket.id
        ? { ...t, status: 'approved', totalScore: dynamicScore, classification: predictClassification(dynamicScore), roundedScore: Math.round(dynamicScore / 5) * 5 }
        : t
    ));
    showToast('success', `Đã phê duyệt phiếu của ${selectedTicket.userName} - Tổng điểm: ${dynamicScore}/${selectedTicket.maxScore}`);
    setSelectedTicket(null);
    setCtstScore(0);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      showToast('error', 'Vui lòng nhập lý do trả phiếu');
      return;
    }
    if (!selectedTicket) return;
    setTickets(prev => prev.map(t =>
      t.id === selectedTicket.id ? { ...t, status: 'rejected' } : t
    ));
    showToast('info', `Đã trả lại phiếu của ${selectedTicket.userName} yêu cầu chỉnh sửa`);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedTicket(null);
  };

  const handleRecordViolation = () => {
    if (!violationCode || !violationDesc.trim()) {
      showToast('error', 'Vui lòng chọn mã lỗi và nhập mô tả');
      return;
    }
    showToast('success', `Đã ghi nhận lỗi ${violationCode} cho phiếu`);
    setShowViolationModal(false);
    setViolationCode('');
    setViolationDesc('');
    setViolationEvidence('');
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllProducts = () => {
    if (selectedProductIds.size === MY_PRODUCTS.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(MY_PRODUCTS.map(p => p.id)));
    }
  };

  const handleBulkApprove = () => {
    if (selectedProductIds.size === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    showToast('success', `Đã duyệt nhanh ${selectedProductIds.size} sản phẩm đã chọn`);
    setSelectedProductIds(new Set());
  };

  const openPreview = (product: ProductItem) => {
    setPreviewProduct(product);
    setShowPreview(true);
  };

  const statusConfig: Record<TicketStatus, { label: string; variant: 'gray' | 'yellow' | 'green' | 'red' }> = {
    'draft': { label: 'Nháp', variant: 'gray' },
    'pending-l1': { label: 'Chờ duyệt Cấp 2', variant: 'yellow' },
    'pending-l2': { label: 'Chờ duyệt Cấp 3', variant: 'yellow' },
    'approved': { label: 'Đã duyệt', variant: 'green' },
    'rejected': { label: 'Bị trả lại', variant: 'red' },
  };

  const violationOptions = VIOLATION_CODES.map(v => ({
    value: v.code,
    label: `${v.code} - ${v.label}`,
  }));

  const selectedViolationInfo = VIOLATION_CODES.find(v => v.code === violationCode);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Ticket List */}
      <Card className="p-6">
        <SectionTitle
          title="Danh sách phiếu chờ duyệt"
          subtitle={`${tickets.filter(t => t.status.startsWith('pending')).length} phiếu đang chờ xử lý`}
          icon={<CheckSquare size={18} />}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header" style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>Mã phiếu</th>
                <th className="table-header">Nhân sự</th>
                <th className="table-header">Đơn vị</th>
                <th className="table-header">Số SP</th>
                <th className="table-header">Tổng điểm</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Cờ</th>
                <th className="table-header">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="table-cell font-medium" style={{ position: 'sticky', left: 0, background: 'white' }}>{t.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                        {t.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{t.userName}</p>
                        <p className="text-xs text-neutral-500">{t.userPosition}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{t.unit}</td>
                  <td className="table-cell">{t.totalProducts}</td>
                  <td className="table-cell font-semibold">{t.totalScore}/{t.maxScore}</td>
                  <td className="table-cell">
                    <Badge variant={statusConfig[t.status].variant}>{statusConfig[t.status].label}</Badge>
                  </td>
                  <td className="table-cell">
                    {t.flagCeiling ? (
                      <Tooltip content="Nhân sự vướng lỗi vi phạm - Bị chặn trần xếp loại">
                        <Badge variant="red"><Flag size={12} /> Cờ</Badge>
                      </Tooltip>
                    ) : <span className="text-neutral-300">-</span>}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => { setSelectedTicket(t); setCtstScore(0); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium"
                    >
                      <Eye size={14} /> Thẩm định
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Split View Detail */}
      {selectedTicket && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Left: Declaration Details with Bulk Actions */}
          <Card className="p-6">
            <SectionTitle
              title="Chi tiết khai báo"
              subtitle={`${selectedTicket.userName} - ${selectedTicket.unit}`}
              icon={<FileText size={18} />}
              action={<Badge variant={statusConfig[selectedTicket.status].variant}>{statusConfig[selectedTicket.status].label}</Badge>}
            />

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-50">
                <div>
                  <p className="text-xs text-neutral-500">Nhân sự</p>
                  <p className="text-sm font-medium text-neutral-800">{selectedTicket.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Chức vụ</p>
                  <p className="text-sm font-medium text-neutral-800">{selectedTicket.userPosition}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Đơn vị</p>
                  <p className="text-sm font-medium text-neutral-800">{selectedTicket.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Ngày gửi</p>
                  <p className="text-sm font-medium text-neutral-800">{selectedTicket.submittedDate}</p>
                </div>
              </div>

              {/* Dynamic score display */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50">
                <div>
                  <span className="text-sm font-medium text-primary-700">Tổng điểm động</span>
                  <p className="text-xs text-primary-600 mt-0.5">
                    SP: {Math.round(MY_PRODUCTS.reduce((s, p) => s + (p.maxScore * p.contribution) / 100, 0))} + CTST: {ctstScore} - Vi phạm: {selectedTicket.violations.length * 2}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary-700">{dynamicScore}/{selectedTicket.maxScore}</span>
                  {dynamicClassification && (
                    <p className={`text-xs font-bold ${getClassificationColor(dynamicClassification)}`}>{getClassificationLabel(dynamicClassification)}</p>
                  )}
                </div>
              </div>

              {/* Products with checkboxes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-700">Danh sách sản phẩm</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAllProducts}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      {selectedProductIds.size === MY_PRODUCTS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                </div>
                {MY_PRODUCTS.map(p => (
                  <div key={p.id} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${selectedProductIds.has(p.id) ? 'border-primary-400 bg-primary-50/50' : 'border-neutral-200'}`}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => openPreview(p)}
                      className="flex items-center gap-2 flex-1 min-w-0 hover:text-primary-600 transition-colors"
                    >
                      {p.evidenceType === 'file' ? <Upload size={14} className="text-neutral-400" /> : <LinkIcon size={14} className="text-neutral-400" />}
                      <span className="text-sm text-neutral-700 truncate">{p.category}</span>
                    </button>
                    <span className="text-xs text-neutral-500">{p.contribution}%</span>
                    <Badge variant={p.status === 'da-duyet' ? 'green' : p.status === 'cho-duyet' ? 'yellow' : 'red'}>
                      {p.status === 'da-duyet' ? 'Đã duyệt' : p.status === 'cho-duyet' ? 'Chờ' : 'Sửa'}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Bulk Actions */}
              {selectedProductIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-success-50 border border-success-200 animate-fade-in">
                  <CheckCheck size={18} className="text-success-600" />
                  <span className="text-sm text-success-700 font-medium">{selectedProductIds.size} sản phẩm đã chọn</span>
                  <button onClick={handleBulkApprove} className="btn-success text-xs ml-auto">
                    <CheckCheck size={14} /> Duyệt nhanh các mục đã chọn
                  </button>
                </div>
              )}

              {/* Violations */}
              {selectedTicket.violations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-danger-600">Lỗi vi phạm đã ghi nhận</p>
                  {selectedTicket.violations.map(v => {
                    const info = VIOLATION_CODES.find(vc => vc.code === v.code);
                    return (
                      <div key={v.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-danger-50 border border-danger-200">
                        <AlertTriangle size={14} className="text-danger-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-danger-700">{v.code} - {info?.label}</p>
                          <p className="text-xs text-danger-600">{v.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Right: Evidence Preview & Scoring */}
          <Card className="p-6">
            <SectionTitle
              title="Preview minh chứng"
              subtitle="Xem tài liệu đính kèm"
              icon={<Eye size={18} />}
            />

            {/* Evidence Preview Area */}
            <div className="rounded-xl border-2 border-dashed border-neutral-300 p-8 text-center mb-4 bg-neutral-50">
              <FileText size={40} className="text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">Chọn sản phẩm để xem minh chứng</p>
              <button
                onClick={() => MY_PRODUCTS[0] && openPreview(MY_PRODUCTS[0])}
                className="mt-3 btn-secondary text-xs"
              >
                <Eye size={14} /> Xem minh chứng mẫu
              </button>
            </div>

            {/* CTST Scoring - Dynamic */}
            <div className="p-4 rounded-lg bg-primary-50 border border-primary-200 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-primary-700">Chấm điểm Cải tiến/Sáng tạo (CTST)</p>
                <span className="text-xs text-primary-600">Tự động cập nhật tổng điểm</span>
              </div>
              <p className="text-xs text-primary-600 mb-3">Điểm cộng dựa trên tỷ lệ tham gia cải tiến</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={ctstScore}
                  onChange={e => setCtstScore(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="input w-20 text-center font-semibold"
                />
                <span className="text-sm text-neutral-500">/ 10 điểm</span>
                <div className="flex-1">
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${ctstScore * 10}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setShowViolationModal(true)}
                className="w-full btn-secondary justify-start"
              >
                <AlertTriangle size={16} className="text-warning-600" /> Ghi nhận lỗi vi phạm
              </button>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="btn-danger"
                >
                  <X size={16} /> Trả lại / Yêu cầu sửa
                </button>
                <button
                  onClick={handleApprove}
                  className="btn-success"
                >
                  <Check size={16} /> Phê duyệt
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Trả lại phiếu - Yêu cầu chỉnh sửa"
        size="md"
        footer={
          <>
            <button onClick={() => setShowRejectModal(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleReject} className="btn-danger"><X size={16} /> Xác nhận trả lại</button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Vui lòng nhập lý do trả phiếu. Lý do này sẽ được gửi đến nhân sự để chỉnh sửa.
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Lý do trả phiếu <span className="text-danger-500">*</span></label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Nhập lý do chi tiết..."
              className="input resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Violation Modal */}
      <Modal
        open={showViolationModal}
        onClose={() => setShowViolationModal(false)}
        title="Ghi nhận lỗi vi phạm"
        size="md"
        footer={
          <>
            <button onClick={() => setShowViolationModal(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleRecordViolation} className="btn-primary"><Flag size={16} /> Ghi nhận</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Mã lỗi <span className="text-danger-500">*</span></label>
            <Select
              value={violationCode}
              onChange={setViolationCode}
              options={violationOptions}
              placeholder="Chọn mã lỗi..."
            />
            {selectedViolationInfo && (
              <p className="text-xs text-neutral-500 mt-1.5">{selectedViolationInfo.description}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Mô tả chi tiết <span className="text-danger-500">*</span></label>
            <textarea
              value={violationDesc}
              onChange={e => setViolationDesc(e.target.value)}
              rows={3}
              placeholder="Mô tả chi tiết vi phạm..."
              className="input resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Minh chứng lỗi</label>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-sm text-neutral-600 w-full">
              <Upload size={16} />
              {violationEvidence || 'Tải lên file minh chứng (bắt buộc)'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Evidence Preview */}
      <EvidencePreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        product={previewProduct}
      />
    </div>
  );
}
