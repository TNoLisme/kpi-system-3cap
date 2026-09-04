import { useState, useMemo } from 'react';
import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { EvidencePreview } from '@/components/ui/EvidencePreview';
import {
  ClipboardList, Plus, Trash2, Upload, Link as LinkIcon, FileText,
  Send, AlertTriangle, Eye, RefreshCw, ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { type Role, type ProductItem, type TicketStatus } from '@/types';
import {
  PRODUCT_CATEGORIES, CURRENT_USER,
  getClassificationLabel, getClassificationColor,
} from '@/data/mockData';
import { useKpiStore } from '@/store/KpiStore';
import { calculateTicketScore, applyClassificationCeiling } from '@/domain/kpiRules';

interface Props {
  role: Role;
}

export function SelfAssessment({ role }: Props) {
  const { showToast } = useToast();
  const { state, dispatch } = useKpiStore();
  const isGiangVien = role === 'giang-vien';

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitEvidenceName, setResubmitEvidenceName] = useState('');
  const [resubmitEvidenceType, setResubmitEvidenceType] = useState<'file' | 'link'>('file');
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Lấy ticket của người dùng hiện tại
  const myTicket = useMemo(() => {
    return state.tickets.find(t => t.userId === CURRENT_USER.id) || state.tickets[0];
  }, [state.tickets]);

  // Lấy danh sách sản phẩm thuộc người dùng hiện tại
  const myProducts = useMemo(() => {
    const list = state.myProducts.filter(p => p.userId === CURRENT_USER.id);
    return list.length > 0 ? list : state.myProducts.slice(0, 5);
  }, [state.myProducts]);

  // Tính điểm thuần túy
  const ctPoints = myTicket?.innovationCtPoints || 0;
  const innovationUnits = myTicket?.innovationUnits || 0;
  const violationDeductions = (myTicket?.violations?.length || 0) * 2;

  const { roundedScore, classification } = useMemo(() => {
    const calc = calculateTicketScore(myProducts, ctPoints, innovationUnits, violationDeductions);
    const finalClass = applyClassificationCeiling(calc.classification, [
      myTicket?.ceiling,
      myTicket?.flagCeiling ? 'B2' : null,
    ]);
    return {
      rawScore: calc.rawScore,
      roundedScore: calc.roundedScore,
      classification: finalClass,
    };
  }, [myProducts, ctPoints, innovationUnits, violationDeductions, myTicket]);

  const maxScore = isGiangVien ? 120 : 100;

  const addProduct = () => {
    if (state.isFrozen) {
      showToast('error', 'Hệ thống đã đóng băng dữ liệu Quý');
      return;
    }
    const newProduct: ProductItem = {
      id: `p${Date.now()}`,
      userId: CURRENT_USER.id,
      category: PRODUCT_CATEGORIES[0].label,
      categoryCode: PRODUCT_CATEGORIES[0].code,
      contribution: 10,
      completedDate: '2026-10-05',
      evidenceName: 'Minh_chung_moi.pdf',
      evidenceType: 'file',
      status: 'cho-duyet',
      maxScore: PRODUCT_CATEGORIES[0].maxScore,
    };
    dispatch({ type: 'ADD_PRODUCT', product: newProduct });
    showToast('success', 'Đã thêm sản phẩm mới vào phiếu tự đánh giá');
  };

  const removeProduct = (id: string) => {
    if (state.isFrozen) {
      showToast('error', 'Hệ thống đã đóng băng dữ liệu Quý');
      return;
    }
    dispatch({ type: 'DELETE_PRODUCT', productId: id });
    showToast('info', 'Đã xóa sản phẩm khỏi phiếu');
  };

  const handleSubmit = () => {
    if (state.isFrozen) {
      showToast('error', 'Hệ thống đã đóng băng dữ liệu Quý');
      return;
    }
    dispatch({
      type: 'SUBMIT_ASSESSMENT',
      userId: CURRENT_USER.id,
      actor: CURRENT_USER,
    });
    setShowSubmitModal(false);
    showToast('success', 'Đã gửi phiếu tự đánh giá lên Quản lý trực tiếp (Cấp 2)');
  };

  const handleResubmit = () => {
    if (!resubmitEvidenceName.trim()) {
      showToast('error', 'Vui lòng nhập tên file hoặc liên kết minh chứng bổ sung');
      return;
    }
    if (state.isFrozen) {
      showToast('error', 'Hệ thống đã đóng băng dữ liệu Quý');
      return;
    }
    dispatch({
      type: 'RESUBMIT_TICKET',
      ticketId: myTicket.id,
      evidence: {
        name: resubmitEvidenceName.trim(),
        type: resubmitEvidenceType,
      },
      actor: CURRENT_USER,
    });
    showToast('success', 'Đã nộp lại phiếu tự đánh giá - Trạng thái: Chờ Cấp 2 duyệt');
    setShowResubmitModal(false);
    setResubmitEvidenceName('');
  };

  const openPreview = (product: ProductItem) => {
    setPreviewProduct(product);
    setShowPreview(true);
  };

  const statusConfig: Record<TicketStatus, { label: string; variant: 'gray' | 'yellow' | 'green' | 'red' }> = {
    'draft': { label: 'Nháp', variant: 'gray' },
    'pending-l1': { label: 'Chờ duyệt Cấp 2', variant: 'yellow' },
    'pending-l2': { label: 'Chờ Cấp 2 duyệt', variant: 'yellow' },
    'pending-l3': { label: 'Chờ Cấp 3 duyệt', variant: 'yellow' },
    'pending-council': { label: 'Chờ Hội đồng BGH', variant: 'yellow' },
    'revision-requested': { label: 'Yêu cầu sửa đổi', variant: 'red' },
    'approved': { label: 'Đã duyệt', variant: 'green' },
    'rejected': { label: 'Từ chối', variant: 'red' },
    'frozen': { label: 'Đã đóng băng', variant: 'gray' },
  };

  const isRevisionRequested = myTicket?.status === 'revision-requested';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner frozen */}
      {state.isFrozen && (
        <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-700 flex items-center gap-3">
          <ShieldAlert className="text-neutral-500" size={20} />
          <div>
            <p className="text-sm font-semibold">DỮ LIỆU ĐÃ ĐÓNG BĂNG TOÀN KỲ (QUÝ 3/2026)</p>
            <p className="text-xs text-neutral-500">Mọi thao tác chỉnh sửa, nộp phiếu và minh chứng đang ở chế độ Chỉ đọc (Read-only).</p>
          </div>
        </div>
      )}

      {/* Banner Yêu cầu chỉnh sửa */}
      {isRevisionRequested && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start justify-between gap-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-amber-900">YÊU CẦU BỔ SUNG MINH CHỨNG / CHỈNH SỬA PHIẾU</h4>
                <Badge variant="red">Cần xử lý</Badge>
              </div>
              <p className="text-xs text-amber-800 mt-1 font-medium">
                Ý kiến từ Cấp quản lý: <span className="underline">{myTicket.revisionReason || 'Minh chứng chưa đầy đủ hoặc không hợp lệ, vui lòng bổ sung.'}</span>
              </p>
              {myTicket.approvalHistory?.[0] && (
                <p className="text-[11px] text-amber-600 mt-0.5">
                  Người yêu cầu: {myTicket.approvalHistory[0].actor} ({myTicket.approvalHistory[0].role}) • {new Date(myTicket.approvalHistory[0].at).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
          <button
            disabled={state.isFrozen}
            onClick={() => {
              setResubmitEvidenceName('Minh_chung_bo_sung_Q3.pdf');
              setShowResubmitModal(true);
            }}
            className="btn-primary text-xs px-3 py-2 flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap"
          >
            <RefreshCw size={14} /> Cập nhật & Nộp lại
          </button>
        </div>
      )}

      {/* General Info Block */}
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-50">
              <ClipboardList size={24} className="text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-neutral-900">Khai báo & Tự đánh giá cá nhân</h3>
                <Badge variant={statusConfig[myTicket?.status || 'draft']?.variant || 'gray'}>
                  {statusConfig[myTicket?.status || 'draft']?.label || myTicket?.status}
                </Badge>
              </div>
              <p className="text-sm text-neutral-500">
                Kỳ đánh giá: {state.period} | Nhân sự: {CURRENT_USER.name} ({CURRENT_USER.unit})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">Điểm tự đánh giá</p>
              <p className="text-2xl font-bold text-primary-600">
                {roundedScore}<span className="text-sm text-neutral-400 font-normal">/{maxScore}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">Xếp loại dự kiến</p>
              <div className={`inline-flex px-2.5 py-1 rounded-lg text-sm font-bold ${getClassificationColor(classification)}`}>
                {classification}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">Số sản phẩm</p>
              <p className="text-2xl font-bold text-neutral-900">{myProducts.length}</p>
            </div>
          </div>
        </div>

        {/* Cảnh báo trần nếu có */}
        {(myTicket?.ceiling || myTicket?.flagCeiling) && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Lưu ý chặn trần:</strong> {myTicket.ceiling ? `Đơn vị bị khống chế tối đa mức ${myTicket.ceiling}.` : ''} {myTicket.flagCeiling ? 'Cá nhân vi phạm quy chế bị chặn tối đa B2.' : ''} Mức xếp loại cuối cùng sẽ không vượt quá ngưỡng này.
            </span>
          </div>
        )}
      </Card>

      {/* Products Table */}
      <Card className="p-6">
        <SectionTitle
          title="Danh mục sản phẩm & Minh chứng hoàn thành"
          subtitle="Khai báo các sản phẩm công việc chính trong Quý 3/2026 kèm tài liệu minh chứng"
          icon={<FileText size={18} />}
          action={
            <button
              disabled={state.isFrozen}
              onClick={addProduct}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Plus size={14} /> Thêm sản phẩm
            </button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header">Danh mục sản phẩm</th>
                <th className="table-header">Đóng góp (%)</th>
                <th className="table-header">Ngày hoàn thành</th>
                <th className="table-header">Minh chứng</th>
                <th className="table-header">Điểm định mức</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map(p => (
                <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="table-cell font-medium text-neutral-800">
                    <div>
                      <p className="text-sm font-semibold">{p.category}</p>
                      <p className="text-xs text-neutral-400">Mã: {p.categoryCode}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold text-neutral-700">{p.contribution}%</span>
                  </td>
                  <td className="table-cell text-neutral-600 text-xs">
                    {p.completedDate}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => openPreview(p)}
                      className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline max-w-[200px] truncate"
                      title="Xem tài liệu minh chứng"
                    >
                      {p.evidenceType === 'file' ? <Upload size={13} className="text-neutral-400 flex-shrink-0" /> : <LinkIcon size={13} className="text-neutral-400 flex-shrink-0" />}
                      <span className="truncate">{p.evidenceName || 'Minh_chung.pdf'}</span>
                    </button>
                  </td>
                  <td className="table-cell font-semibold text-neutral-700">
                    {p.maxScore}đ
                  </td>
                  <td className="table-cell">
                    <Badge variant={p.status === 'da-duyet' ? 'green' : p.status === 'cho-duyet' ? 'yellow' : 'red'}>
                      {p.status === 'da-duyet' ? 'Đã duyệt' : p.status === 'cho-duyet' ? 'Chờ duyệt' : 'Yêu cầu sửa'}
                    </Badge>
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openPreview(p)}
                        className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors text-xs flex items-center gap-1"
                        title="Xem chi tiết"
                      >
                        <Eye size={14} /> Xem
                      </button>
                      <button
                        disabled={state.isFrozen}
                        onClick={() => removeProduct(p.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CTA Gửi phiếu */}
      <div className="flex justify-end gap-3 pt-2">
        {isRevisionRequested ? (
          <button
            disabled={state.isFrozen}
            onClick={() => {
              setResubmitEvidenceName('Minh_chung_bo_sung_Q3.pdf');
              setShowResubmitModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={16} /> Cập nhật & Nộp lại
          </button>
        ) : (
          <button
            disabled={state.isFrozen || myTicket?.status !== 'draft'}
            onClick={() => setShowSubmitModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={16} /> {myTicket?.status === 'draft' ? 'Gửi phiếu lên Cấp 2' : 'Phiếu đã nộp'}
          </button>
        )}
      </div>

      {/* Modal gửi phiếu */}
      <Modal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Xác nhận gửi phiếu tự đánh giá"
        size="sm"
        footer={
          <>
            <button onClick={() => setShowSubmitModal(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleSubmit} className="btn-primary">
              <Send size={16} /> Xác nhận gửi
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            Bạn có chắc chắn muốn nộp phiếu tự đánh giá Quý 3/2026 lên Quản lý trực tiếp (Cấp 2)?
          </p>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tổng điểm tự đánh giá:</span>
              <span className="font-bold text-primary-600">{roundedScore}/{maxScore}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-neutral-500">Xếp loại dự kiến:</span>
              <span className={`font-bold ${getClassificationColor(classification)}`}>
                {getClassificationLabel(classification)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Cập nhật & Nộp lại */}
      <Modal
        open={showResubmitModal}
        onClose={() => setShowResubmitModal(false)}
        title="Cập nhật minh chứng & Nộp lại phiếu"
        size="md"
        footer={
          <>
            <button onClick={() => setShowResubmitModal(false)} className="btn-secondary">Hủy</button>
            <button onClick={handleResubmit} className="btn-primary">
              <RefreshCw size={16} /> Cập nhật & Nộp lại
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1">Lý do yêu cầu sửa đổi trước đó:</p>
            <p className="text-sm text-amber-900">{myTicket?.revisionReason || 'Vui lòng bổ sung minh chứng hoàn chỉnh.'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Hình thức minh chứng bổ sung
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="radio"
                  name="resubmitType"
                  value="file"
                  checked={resubmitEvidenceType === 'file'}
                  onChange={() => setResubmitEvidenceType('file')}
                  className="text-primary-600"
                />
                Tệp tài liệu (PDF, Word)
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                <input
                  type="radio"
                  name="resubmitType"
                  value="link"
                  checked={resubmitEvidenceType === 'link'}
                  onChange={() => setResubmitEvidenceType('link')}
                  className="text-primary-600"
                />
                Liên kết trực tuyến (URL)
              </label>
            </div>

            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tên file hoặc URL minh chứng mới <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              value={resubmitEvidenceName}
              onChange={e => setResubmitEvidenceName(e.target.value)}
              placeholder={resubmitEvidenceType === 'file' ? 'Bao_cao_bo_sung_co_chu_ky.pdf' : 'https://journal.ueb.edu.vn/article/view/123'}
              className="input w-full"
            />
          </div>

          <div className="p-3 rounded-lg bg-primary-50 border border-primary-100 text-xs text-primary-800 flex items-start gap-2">
            <CheckCircle2 size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
            <span>Sau khi bấm "Cập nhật & Nộp lại", trạng thái phiếu sẽ chuyển thành <strong>Chờ Cấp 2 duyệt</strong> để cấp quản lý thẩm định lại.</span>
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
