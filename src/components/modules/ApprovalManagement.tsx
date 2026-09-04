import { useState, useMemo } from 'react';
import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { EvidencePreview } from '@/components/ui/EvidencePreview';
import {
  CheckSquare, FileText, Check, X, Flag, AlertTriangle, Upload,
  Link as LinkIcon, Eye, CheckCheck,
  Send, ShieldAlert,
} from 'lucide-react';
import { type AssessmentTicket, type ProductItem, type TicketStatus, type Role } from '@/types';
import {
  CURRENT_USER,
  getClassificationLabel, getClassificationColor,
} from '@/data/mockData';
import { useKpiStore } from '@/store/KpiStore';
import { calculateTicketScore, applyClassificationCeiling } from '@/domain/kpiRules';

interface ApprovalManagementProps {
  role?: Role;
}

export function ApprovalManagement({ role = 'truong-khoa' }: ApprovalManagementProps) {
  const { showToast } = useToast();
  const { state, dispatch } = useKpiStore();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [ctPoints, setCtPoints] = useState<number>(0);
  const [innovationUnits, setInnovationUnits] = useState<number>(0);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Lọc hàng đợi theo vai trò
  const filteredTickets = useMemo(() => {
    if (role === 'truong-khoa') {
      return state.tickets.filter(t => t.status === 'pending-l2');
    }
    if (role === 'lanh-dao') {
      return state.tickets.filter(t => t.status === 'pending-l3');
    }
    return state.tickets;
  }, [state.tickets, role]);

  const selectedTicket = useMemo(() => {
    if (!selectedTicketId) return null;
    return state.tickets.find(t => t.id === selectedTicketId) || null;
  }, [state.tickets, selectedTicketId]);

  // Sản phẩm của nhân sự được chọn
  const ticketProducts = useMemo(() => {
    if (!selectedTicket) return [];
    const userProducts = state.myProducts.filter(p => p.userId === selectedTicket.userId);
    return userProducts.length > 0 ? userProducts : state.myProducts.slice(0, selectedTicket.totalProducts || 5);
  }, [selectedTicket, state.myProducts]);

  // Tính điểm động theo kpiRules
  const { rawScore, roundedScore, dynamicClassification } = useMemo(() => {
    if (!selectedTicket) return { rawScore: 0, roundedScore: 0, dynamicClassification: null };
    const violationDeductions = selectedTicket.violations.length * 2;
    const calc = calculateTicketScore(ticketProducts, ctPoints, innovationUnits, violationDeductions);
    const capped = applyClassificationCeiling(calc.classification, [
      selectedTicket.ceiling,
      selectedTicket.flagCeiling ? 'B2' : null,
    ]);
    return {
      rawScore: calc.rawScore,
      roundedScore: calc.roundedScore,
      dynamicClassification: capped,
    };
  }, [selectedTicket, ticketProducts, ctPoints, innovationUnits]);

  const handleSelectTicket = (t: AssessmentTicket) => {
    setSelectedTicketId(t.id);
    setCtPoints(t.innovationCtPoints || 0);
    setInnovationUnits(t.innovationUnits || 0);
  };

  const handleApproveLevel2 = () => {
    if (!selectedTicket) return;
    if (state.isFrozen) {
      showToast('error', 'Hệ thống đã đóng băng dữ liệu Quý');
      return;
    }
    dispatch({
      type: 'APPROVE_L2',
      ticketId: selectedTicket.id,
      ctPoints,
      innovationUnits,
      actor: CURRENT_USER,
    });
    showToast('success', `Đã phê duyệt Cấp 2 cho ${selectedTicket.userName} (${roundedScore}đ, ${dynamicClassification}) - Chuyển Cấp 3 thẩm định`);
    setSelectedTicketId(null);
  };

  const handleApproveLevel3 = () => {
    if (!selectedTicket) return;
    if (state.isFrozen) {
      showToast('error', 'Hệ thống đã đóng băng dữ liệu Quý');
      return;
    }
    dispatch({
      type: 'APPROVE_L3',
      ticketId: selectedTicket.id,
      actor: CURRENT_USER,
    });
    showToast('success', `Đã phê duyệt Cấp 3 cho ${selectedTicket.userName} - Chuyển Hội đồng BGH ban hành`);
    setSelectedTicketId(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      showToast('error', 'Vui lòng nhập lý do yêu cầu chỉnh sửa');
      return;
    }
    if (!selectedTicket) return;
    if (state.isFrozen) {
      showToast('error', 'Hệ thống đã đóng băng dữ liệu Quý');
      return;
    }
    dispatch({
      type: 'REQUEST_REVISION',
      ticketId: selectedTicket.id,
      reason: rejectReason.trim(),
      actor: CURRENT_USER,
    });
    showToast('info', `Đã gửi yêu cầu chỉnh sửa tới ${selectedTicket.userName}`);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedTicketId(null);
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
    if (selectedProductIds.size === ticketProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(ticketProducts.map(p => p.id)));
    }
  };

  const handleBulkApprove = () => {
    if (selectedProductIds.size === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    showToast('success', `Đã xác nhận đạt chuẩn cho ${selectedProductIds.size} sản phẩm đã chọn`);
    setSelectedProductIds(new Set());
  };

  const openPreview = (product: ProductItem) => {
    setPreviewProduct(product);
    setShowPreview(true);
  };

  const statusConfig: Record<TicketStatus, { label: string; variant: 'gray' | 'yellow' | 'green' | 'red' }> = {
    'draft': { label: 'Nháp', variant: 'gray' },
    'pending-l1': { label: 'Chờ duyệt Cấp 2', variant: 'yellow' },
    'pending-l2': { label: 'Chờ duyệt Cấp 2 (Khoa)', variant: 'yellow' },
    'pending-l3': { label: 'Chờ duyệt Cấp 3 (TCNS)', variant: 'yellow' },
    'pending-council': { label: 'Chờ Hội đồng BGH', variant: 'yellow' },
    'revision-requested': { label: 'Yêu cầu sửa đổi', variant: 'red' },
    'approved': { label: 'Đã duyệt', variant: 'green' },
    'rejected': { label: 'Từ chối', variant: 'red' },
    'frozen': { label: 'Đã đóng băng', variant: 'gray' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {state.isFrozen && (
        <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-700 flex items-center gap-3">
          <ShieldAlert className="text-neutral-500" size={20} />
          <div>
            <p className="text-sm font-semibold">DỮ LIỆU ĐÃ ĐÓNG BĂNG TOÀN KỲ</p>
            <p className="text-xs text-neutral-500">Kỳ đánh giá Quý 3/2026 đã đóng. Toàn bộ thao tác thẩm định và phê duyệt đang ở chế độ Chỉ đọc.</p>
          </div>
        </div>
      )}

      {/* Ticket List */}
      <Card className="p-6">
        <SectionTitle
          title={`Danh sách phiếu chờ duyệt - ${role === 'truong-khoa' ? 'Cấp 2 (Trưởng Khoa/Phòng)' : role === 'lanh-dao' ? 'Cấp 3 (Lãnh đạo & TCNS)' : 'Quản trị'}`}
          subtitle={`${filteredTickets.length} phiếu đang chờ xử lý trong thẩm quyền`}
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
                <th className="table-header">Cờ / Trần</th>
                <th className="table-header">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-neutral-400 text-sm">
                    Không có phiếu nào đang chờ duyệt trong cấp này.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => (
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
                      <Badge variant={statusConfig[t.status]?.variant || 'gray'}>
                        {statusConfig[t.status]?.label || t.status}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {t.ceiling && (
                          <Tooltip content={`Chặn trần: ${t.ceiling} (${t.ceilingReasons?.join(', ') || 'Quy chế KPI'})`}>
                            <Badge variant="yellow">Trần {t.ceiling}</Badge>
                          </Tooltip>
                        )}
                        {t.flagCeiling && (
                          <Tooltip content="Nhân sự vi phạm quy chế - Chặn trần tối đa B2">
                            <Badge variant="red"><Flag size={12} /> Cờ B2</Badge>
                          </Tooltip>
                        )}
                        {!t.ceiling && !t.flagCeiling && <span className="text-neutral-300">-</span>}
                      </div>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleSelectTicket(t)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium"
                      >
                        <Eye size={14} /> Thẩm định
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Split View Detail */}
      {selectedTicket && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          {/* Left: Declaration Details */}
          <Card className="p-6">
            <SectionTitle
              title="Chi tiết khai báo & minh chứng"
              subtitle={`${selectedTicket.userName} - ${selectedTicket.unit}`}
              icon={<FileText size={18} />}
              action={<Badge variant={statusConfig[selectedTicket.status]?.variant || 'gray'}>{statusConfig[selectedTicket.status]?.label || selectedTicket.status}</Badge>}
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
                  <p className="text-xs text-neutral-500">Ngày nộp</p>
                  <p className="text-sm font-medium text-neutral-800">{selectedTicket.submittedDate || '02/10/2026'}</p>
                </div>
              </div>

              {/* Dynamic score summary */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-primary-50 border border-primary-100">
                <div>
                  <span className="text-sm font-medium text-primary-800">Điểm tổng thẩm định</span>
                  <p className="text-xs text-primary-600 mt-0.5">
                    Thô: {rawScore.toFixed(1)}đ | Làm tròn: <strong>{roundedScore}đ</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary-700">{roundedScore}/{selectedTicket.maxScore}</span>
                  {dynamicClassification && (
                    <p className="text-xs font-bold mt-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded ${getClassificationColor(dynamicClassification)}`}>
                        {getClassificationLabel(dynamicClassification)}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Products list with evidence link */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-700">Sản phẩm & Minh chứng ({ticketProducts.length})</p>
                  <button
                    onClick={toggleAllProducts}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {selectedProductIds.size === ticketProducts.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>

                {ticketProducts.map(p => (
                  <div key={p.id} className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${selectedProductIds.has(p.id) ? 'border-primary-400 bg-primary-50/50' : 'border-neutral-200'}`}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(p.id)}
                      onChange={() => toggleProductSelection(p.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <button
                      onClick={() => openPreview(p)}
                      className="flex items-center gap-2 flex-1 min-w-0 hover:text-primary-600 text-left transition-colors"
                      title="Click để xem tài liệu minh chứng"
                    >
                      {p.evidenceType === 'file' ? <Upload size={14} className="text-neutral-400 flex-shrink-0" /> : <LinkIcon size={14} className="text-neutral-400 flex-shrink-0" />}
                      <span className="text-sm text-neutral-700 truncate font-medium">{p.category}</span>
                    </button>
                    <span className="text-xs text-neutral-500">{p.contribution}%</span>
                    <button
                      onClick={() => openPreview(p)}
                      className="btn-secondary text-[11px] px-2 py-1 flex items-center gap-1"
                    >
                      <Eye size={12} /> Xem MC
                    </button>
                  </div>
                ))}
              </div>

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
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-semibold text-danger-600">Lỗi vi phạm đã ghi nhận</p>
                  {selectedTicket.violations.map(v => (
                    <div key={v.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-danger-50 border border-danger-200">
                      <AlertTriangle size={14} className="text-danger-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-danger-700">{v.code} - {v.description}</p>
                        <p className="text-xs text-danger-600">Ghi nhận: {v.recordedBy} ({v.date})</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Right: CTST Scoring & Approval Actions */}
          <Card className="p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <SectionTitle
                title="Chấm điểm Cải tiến / Sáng tạo (CTST)"
                subtitle="Cấp quản lý trực tiếp đánh giá tiêu chí gia tăng"
                icon={<Eye size={18} />}
              />

              {/* CT / ST scoring inputs */}
              <div className="p-4 rounded-xl bg-primary-50 border border-primary-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-primary-800 mb-1">
                    Điểm Cải tiến (CT) - Tối đa 10 điểm
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={ctPoints}
                      disabled={state.isFrozen}
                      onChange={e => setCtPoints(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="input w-24 text-center font-bold text-primary-700"
                    />
                    <span className="text-xs text-primary-600">Đóng góp sáng kiến, cải tiến quy trình công việc</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-800 mb-1">
                    Số đơn vị Sáng tạo (ST) - Mỗi đơn vị tính +3 điểm
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={innovationUnits}
                      disabled={state.isFrozen}
                      onChange={e => setInnovationUnits(Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="input w-24 text-center font-bold text-primary-700"
                    />
                    <span className="text-xs text-primary-600">
                      = +{innovationUnits * 3} điểm (Quy đổi: ST × 3)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-primary-200/60 flex justify-between text-xs font-semibold text-primary-900">
                  <span>Tổng điểm CTST cộng thêm:</span>
                  <span className="text-primary-700 text-sm">+{ctPoints + innovationUnits * 3} điểm</span>
                </div>
              </div>

              {/* Approval History */}
              {selectedTicket.approvalHistory && selectedTicket.approvalHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Lịch sử thẩm định & duyệt</p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedTicket.approvalHistory.map(ev => (
                      <div key={ev.id} className="text-xs p-2 rounded bg-neutral-50 border border-neutral-200">
                        <div className="flex justify-between font-medium text-neutral-700">
                          <span>{ev.actor} ({ev.role})</span>
                          <span className="text-neutral-400">{new Date(ev.at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {ev.note && <p className="text-neutral-500 mt-0.5">{ev.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-6 border-t border-neutral-200">
              <div className="grid grid-cols-2 gap-3">
                <button
                  disabled={state.isFrozen}
                  onClick={() => setShowRejectModal(true)}
                  className="btn-danger w-full justify-center"
                >
                  <X size={16} /> Yêu cầu chỉnh sửa
                </button>

                {role === 'lanh-dao' ? (
                  <button
                    disabled={state.isFrozen}
                    onClick={handleApproveLevel3}
                    className="btn-primary w-full justify-center"
                  >
                    <Check size={16} /> Phê duyệt & Chuyển BGH
                  </button>
                ) : (
                  <button
                    disabled={state.isFrozen}
                    onClick={handleApproveLevel2}
                    className="btn-primary w-full justify-center"
                  >
                    <Check size={16} /> Phê duyệt & Chuyển Cấp 3
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reject / Revision Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Yêu cầu nhân sự chỉnh sửa / bổ sung minh chứng"
        size="md"
        footer={
          <>
            <button onClick={() => setShowRejectModal(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleReject} className="btn-danger">
              <Send size={16} /> Gửi yêu cầu chỉnh sửa
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            Phiếu sẽ được chuyển về trạng thái <strong>Yêu cầu sửa đổi</strong> và thông báo cho nhân sự <strong>{selectedTicket?.userName}</strong> để nộp lại.
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Lý do yêu cầu sửa đổi / tài liệu cần bổ sung <span className="text-danger-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Minh chứng sản phẩm SP04 chưa có quyết định kèm theo, đề nghị bổ sung file scan có dấu đỏ..."
              className="input w-full"
            />
          </div>
        </div>
      </Modal>

      {/* Evidence Preview Modal */}
      <EvidencePreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        product={previewProduct}
      />
    </div>
  );
}
