import { useState, useMemo } from 'react';
import { Card, SectionTitle, Badge, Select } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EvidencePreview } from '@/components/ui/EvidencePreview';
import {
  ClipboardList, Plus, Trash2, Upload, Link as LinkIcon, FileText,
  ChevronDown, ChevronRight, Send, GraduationCap, Info, Calendar,
  Eye, RefreshCw, MessageSquare,
} from 'lucide-react';
import { type Role, type ProductItem } from '@/types';
import {
  PRODUCT_CATEGORIES, MY_PRODUCTS, GIANG_VIEN_GROUPS, CURRENT_PERIOD,
  predictClassification, getClassificationLabel, getClassificationColor,
} from '@/data/mockData';

interface Props {
  role: Role;
}

export function SelfAssessment({ role }: Props) {
  const { showToast } = useToast();
  const isGiangVien = role === 'giang-vien';
  const [products, setProducts] = useState<ProductItem[]>(MY_PRODUCTS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(GIANG_VIEN_GROUPS.map(g => [g.id, true]))
  );
  const [ctstScore, setCtstScore] = useState(5);
  const [violationDeduction, setViolationDeduction] = useState(3);
  const [showRevisionModal, setShowRevisionModal] = useState<string | null>(null);
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Dynamic recalculation: Tổng điểm = (Điểm định mức × Tỷ lệ đóng góp %) + Điểm CTST - Điểm trừ vi phạm
  const { totalScore, maxScore } = useMemo(() => {
    const productScore = products.reduce((sum, p) => {
      return sum + (p.maxScore * p.contribution) / 100;
    }, 0);
    const total = Math.round(productScore + ctstScore - violationDeduction);
    const max = isGiangVien ? 120 : 100;
    return { totalScore: Math.max(0, total), maxScore: max };
  }, [products, ctstScore, violationDeduction, isGiangVien]);

  const predictedClass = predictClassification(totalScore);

  const categoryOptions = PRODUCT_CATEGORIES.map(c => ({ value: c.code, label: `${c.code} - ${c.label}` }));

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: `p${Date.now()}`,
      category: PRODUCT_CATEGORIES[0].label,
      categoryCode: PRODUCT_CATEGORIES[0].code,
      contribution: 10,
      completedDate: '2026-09-01',
      evidenceName: '',
      evidenceType: 'file',
      status: 'cho-duyet',
      maxScore: PRODUCT_CATEGORIES[0].maxScore,
    };
    setProducts(prev => [...prev, newProduct]);
    showToast('success', 'Đã thêm sản phẩm mới - Điểm tổng tích lũy đã được cập nhật');
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('info', 'Đã xóa sản phẩm - Điểm tổng tích lũy đã được cập nhật');
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: string | number) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      if (field === 'categoryCode') {
        const cat = PRODUCT_CATEGORIES.find(c => c.code === value);
        if (cat) {
          updated.category = cat.label;
          updated.maxScore = cat.maxScore;
        }
      }
      return updated;
    }));
  };

  const handleResubmit = () => {
    if (!showRevisionModal) return;
    setProducts(prev => prev.map(p =>
      p.id === showRevisionModal
        ? { ...p, status: 'cho-duyet', evidenceName: `Minh_chung_sua_${Date.now()}.pdf`, revisionFeedback: undefined }
        : p
    ));
    showToast('success', 'Đã cập nhật minh chứng và nộp lại sản phẩm - Chuyển về trạng thái Chờ duyệt');
    setShowRevisionModal(null);
  };

  const openPreview = (product: ProductItem) => {
    setPreviewProduct(product);
    setShowPreview(true);
  };

  const handleSubmit = () => {
    setShowSubmitModal(false);
    showToast('success', 'Đã gửi phiếu tự đánh giá lên cấp trên (Cấp 2)');
  };

  const statusConfig = {
    'cho-duyet': { label: 'Chờ duyệt', variant: 'yellow' as const },
    'da-duyet': { label: 'Đã duyệt', variant: 'green' as const },
    'yeu-cau-sua': { label: 'Yêu cầu sửa', variant: 'red' as const },
  };

  const revisionProduct = products.find(p => p.id === showRevisionModal);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* General Info Block with Dynamic Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-50">
              <ClipboardList size={24} className="text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Khai báo & Tự đánh giá</h3>
              <p className="text-sm text-neutral-500">Kỳ đánh giá: {CURRENT_PERIOD} | Hạn nộp: 05/09/2026</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">Tổng điểm động</p>
              <p className="text-2xl font-bold text-primary-600 transition-all">{totalScore}<span className="text-base text-neutral-400 font-normal">/{maxScore}</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">Xếp loại dự kiến</p>
              <div className={`inline-flex px-2.5 py-0.5 rounded-lg text-sm font-bold ${getClassificationColor(predictedClass)}`}>
                {predictedClass}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-1">Số sản phẩm</p>
              <p className="text-2xl font-bold text-neutral-900">{products.length}</p>
            </div>
          </div>
        </div>
        {/* Dynamic formula display */}
        <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center gap-2 text-xs text-neutral-600">
          <Info size={14} className="text-primary-500" />
          <span>
            Công thức: (Điểm định mức x Tỷ lệ đóng góp%) + CTST ({ctstScore}đ) - Vi phạm ({violationDeduction}đ) = <strong className="text-primary-600">{totalScore} điểm</strong>
          </span>
        </div>
      </Card>

      {/* Product Declaration Table */}
      <Card className="p-6">
        <SectionTitle
          title="Bảng khai báo sản phẩm"
          subtitle="Chọn danh mục từ danh sách chuẩn - Điểm định mức tự động"
          icon={<FileText size={18} />}
          action={
            <button onClick={addProduct} className="btn-primary">
              <Plus size={16} /> Thêm sản phẩm
            </button>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="table-header" style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>#</th>
                <th className="table-header">Danh mục sản phẩm</th>
                <th className="table-header">Điểm định mức</th>
                <th className="table-header">Tỷ lệ đóng góp (%)</th>
                <th className="table-header">Ngày hoàn thành</th>
                <th className="table-header">Minh chứng</th>
                <th className="table-header">Trạng thái</th>
                <th className="table-header">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id} className={`border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${p.status === 'yeu-cau-sua' ? 'bg-danger-50/30' : ''}`}>
                  <td className="table-cell text-neutral-400" style={{ position: 'sticky', left: 0, background: 'white' }}>{idx + 1}</td>
                  <td className="table-cell" style={{ minWidth: '200px' }}>
                    <Select
                      value={p.categoryCode}
                      onChange={v => updateProduct(p.id, 'categoryCode', v)}
                      options={categoryOptions}
                    />
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-neutral-800">{p.maxScore}</span>
                      <span className="text-xs text-neutral-400">điểm</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={p.contribution}
                      onChange={e => updateProduct(p.id, 'contribution', Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="input w-20"
                    />
                  </td>
                  <td className="table-cell">
                    <input
                      type="date"
                      value={p.completedDate}
                      onChange={e => updateProduct(p.id, 'completedDate', e.target.value)}
                      className="input w-40"
                    />
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => p.evidenceName ? openPreview(p) : showToast('info', 'Chưa có minh chứng')}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-xs text-neutral-600"
                    >
                      {p.evidenceType === 'file' ? <Upload size={14} /> : <LinkIcon size={14} />}
                      {p.evidenceName ? <span className="truncate max-w-[120px]">{p.evidenceName}</span> : 'Tải lên / Link'}
                    </button>
                  </td>
                  <td className="table-cell">
                    {p.status === 'yeu-cau-sua' ? (
                      <button onClick={() => setShowRevisionModal(p.id)} className="hover:underline">
                        <Badge variant="red">{statusConfig[p.status].label}</Badge>
                      </button>
                    ) : (
                      <Badge variant={statusConfig[p.status].variant}>{statusConfig[p.status].label}</Badge>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {p.evidenceName && (
                        <button
                          onClick={() => openPreview(p)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          title="Xem minh chứng"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      {p.status === 'yeu-cau-sua' && (
                        <button
                          onClick={() => setShowRevisionModal(p.id)}
                          className="p-1.5 rounded-lg text-warning-600 hover:bg-warning-50 transition-colors"
                          title="Xem lý do yêu cầu sửa"
                        >
                          <MessageSquare size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-primary-50 border border-primary-200 flex items-start gap-2">
          <Info size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-700">
            Điểm định mức được hệ thống tự động khóa theo danh mục chuẩn. Không thể nhập tay.
            Tỷ lệ đóng góp từ 1% - 100%. Minh chứng chấp nhận PDF, Docs, Image hoặc URL.
          </p>
        </div>
      </Card>

      {/* Giảng viên Accordion Form */}
      {isGiangVien && (
        <Card className="p-6">
          <SectionTitle
            title="Khung điểm Giảng viên (120 điểm)"
            subtitle="Khai báo theo 5 nhóm tiêu chí"
            icon={<GraduationCap size={18} />}
          />
          <div className="space-y-3">
            {GIANG_VIEN_GROUPS.map(group => {
              const expanded = expandedGroups[group.id];
              const groupScore = group.items.reduce((s, i) => s + i.score, 0);
              return (
                <div key={group.id} className="rounded-xl border border-neutral-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedGroups(prev => ({ ...prev, [group.id]: !prev[group.id] }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expanded ? <ChevronDown size={18} className="text-neutral-400" /> : <ChevronRight size={18} className="text-neutral-400" />}
                      <span className="text-sm font-semibold text-neutral-800">{group.label}</span>
                      <Badge variant="blue">Tối đa {group.maxScore}đ</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary-600">{groupScore}</span>
                      <span className="text-xs text-neutral-400">/{group.maxScore}đ</span>
                    </div>
                  </button>
                  {expanded && (
                    <div className="p-4 space-y-3 animate-fade-in">
                      {group.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-white border border-neutral-200">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-700">{item.label}</p>
                            <p className="text-xs text-neutral-500">Tối đa: {item.maxScore}đ</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={item.maxScore}
                              defaultValue={item.score}
                              className="input w-20 text-center font-semibold"
                            />
                            <span className="text-sm text-neutral-400">/{item.maxScore}đ</span>
                          </div>
                        </div>
                      ))}
                      <div className="px-3">
                        <ProgressBar value={groupScore} max={group.maxScore} height="sm" showValue={false} color={groupScore >= group.maxScore * 0.8 ? 'success' : 'warning'} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* CTST & Violation controls */}
      <Card className="p-6">
        <SectionTitle title="Điểm cộng/trừ bổ sung" subtitle="Điểm sáng tạo (CTST) và trừ vi phạm" icon={<RefreshCw size={18} />} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
            <p className="text-sm font-semibold text-primary-700 mb-2">Điểm Cải tiến/Sáng tạo (CTST)</p>
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
          <div className="p-4 rounded-lg bg-danger-50 border border-danger-200">
            <p className="text-sm font-semibold text-danger-700 mb-2">Điểm trừ vi phạm</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={20}
                value={violationDeduction}
                onChange={e => setViolationDeduction(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                className="input w-20 text-center font-semibold"
              />
              <span className="text-sm text-neutral-500">/ 20 điểm</span>
              <div className="flex-1">
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-danger-500 rounded-full transition-all duration-300" style={{ width: `${(violationDeduction / 20) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* CTA Submit */}
      <div className="flex justify-end gap-3">
        <button className="btn-secondary">
          <Calendar size={16} /> Lưu nháp
        </button>
        <button onClick={() => setShowSubmitModal(true)} className="btn-primary">
          <Send size={16} /> Gửi cấp trên
        </button>
      </div>

      {/* Submit Confirm Modal */}
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
            Bạn có chắc chắn muốn gửi phiếu tự đánh giá lên cấp trên (Cấp 2) để phê duyệt?
          </p>
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tổng điểm hiện tại:</span>
              <span className="font-bold text-primary-600">{totalScore}/{maxScore}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-neutral-500">Xếp loại dự kiến:</span>
              <span className={`font-bold ${getClassificationColor(predictedClass)}`}>{getClassificationLabel(predictedClass)}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 flex items-start gap-2">
            <Info size={16} className="text-warning-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-warning-700">
              Sau khi gửi, bạn sẽ không thể chỉnh sửa phiếu cho đến khi được phê duyệt hoặc bị trả lại yêu cầu sửa đổi.
            </p>
          </div>
        </div>
      </Modal>

      {/* Revision Feedback Modal */}
      <Modal
        open={showRevisionModal !== null}
        onClose={() => setShowRevisionModal(null)}
        title="Yêu cầu chỉnh sửa sản phẩm"
        size="md"
        footer={
          <>
            <button onClick={() => setShowRevisionModal(null)} className="btn-secondary">Đóng</button>
            <button onClick={handleResubmit} className="btn-primary">
              <RefreshCw size={16} /> Cập nhật & Nộp lại
            </button>
          </>
        }
      >
        {revisionProduct && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">Sản phẩm</p>
              <p className="text-sm font-medium text-neutral-800">{revisionProduct.category} ({revisionProduct.categoryCode})</p>
            </div>
            <div className="p-4 rounded-lg bg-warning-50 border border-warning-200">
              <div className="flex items-start gap-3">
                <MessageSquare size={18} className="text-warning-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-warning-700 mb-1">Ý kiến phản hồi từ {revisionProduct.revisionFrom || 'Quản lý trực tiếp'}</p>
                  <p className="text-sm text-warning-600">{revisionProduct.revisionFeedback || 'Vui lòng bổ sung minh chứng rõ nét và hoàn chỉnh.'}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tải lên minh chứng mới</label>
              <button
                onClick={() => showToast('info', 'Đã chọn file mới')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-sm text-neutral-600 w-full"
              >
                <Upload size={16} />
                Chọn file minh chứng mới (PDF, Docs, Image)
              </button>
            </div>
            <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 flex items-start gap-2">
              <Info size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary-700">
                Sau khi nộp lại, sản phẩm sẽ chuyển về trạng thái "Chờ duyệt" và được gửi lại cho quản lý trực tiếp.
              </p>
            </div>
          </div>
        )}
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
