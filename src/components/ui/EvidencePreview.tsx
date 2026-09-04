import { type ProductItem } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Download, X, FileText, Link as LinkIcon, Shield } from 'lucide-react';

interface EvidencePreviewProps {
  open: boolean;
  onClose: () => void;
  product: ProductItem | null;
}

export function EvidencePreview({ open, onClose, product }: EvidencePreviewProps) {
  if (!product) return null;

  const isLink = product.evidenceType === 'link';
  const fileName = product.evidenceName || 'Minh_chung.pdf';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Xem minh chứng"
      size="xl"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            <X size={16} /> Đóng
          </button>
          <button className="btn-primary">
            <Download size={16} /> Tải về
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* File info bar */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
          {isLink ? <LinkIcon size={20} className="text-primary-600" /> : <FileText size={20} className="text-primary-600" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 truncate">{fileName}</p>
            <p className="text-xs text-neutral-500">{isLink ? 'Liên kết trực tuyến' : 'Tài liệu PDF'} - {(product.category)}</p>
          </div>
          <span className="text-xs text-neutral-400">Đóng góp {product.contribution}%</span>
        </div>

        {/* Document preview area */}
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden" style={{ minHeight: '400px' }}>
          {/* Document header */}
          <div className="px-8 py-6 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className="text-primary-600" />
                  <h4 className="text-base font-bold text-neutral-900">{product.category}</h4>
                </div>
                <p className="text-xs text-neutral-500">Mã sản phẩm: {product.categoryCode}</p>
                <p className="text-xs text-neutral-500">Ngày hoàn thành: {product.completedDate}</p>
              </div>
              {/* Mock stamp */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-primary-500 flex items-center justify-center opacity-30 rotate-[-15deg]">
                  <div className="text-center">
                    <p className="text-[8px] font-bold text-primary-600">ĐÃ DUYỆT</p>
                    <p className="text-[7px] text-primary-600">Q3/2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document body - simulated content */}
          <div className="px-8 py-6 space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-neutral-900 uppercase">{product.category}</h3>
              <p className="text-sm text-neutral-500 mt-1">Kỳ đánh giá Quý 3 / 2026</p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">I. Thông tin chung</p>
                <div className="space-y-1 pl-4">
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Số quyết định:</span>
                    <span className="text-xs text-neutral-700">QĐ-2026-{product.categoryCode}-{Math.floor(Math.random() * 999)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Đơn vị chủ quản:</span>
                    <span className="text-xs text-neutral-700">Phòng Đào tạo</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Người thực hiện:</span>
                    <span className="text-xs text-neutral-700">Nguyễn Văn An</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Tỷ lệ đóng góp:</span>
                    <span className="text-xs text-neutral-700">{product.contribution}%</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">II. Tóm tắt nội dung</p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Sản phẩm thuộc danh mục "{product.category}" được thực hiện trong kỳ đánh giá Quý 3/2026.
                  Nội dung bao gồm các công việc chuyên môn liên quan đến {product.category.toLowerCase()},
                  với tỷ lệ đóng góp {product.contribution}% vào tổng điểm KPI. Điểm định mức cho danh mục này
                  là {product.maxScore} điểm. Tài liệu minh chứng đã được đính kèm và xác nhận bởi đơn vị chủ quản.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">III. Kết quả & Đánh giá</p>
                <div className="space-y-1 pl-4">
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Điểm định mức:</span>
                    <span className="text-xs font-semibold text-neutral-700">{product.maxScore} điểm</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Điểm thực tế:</span>
                    <span className="text-xs font-semibold text-primary-600">{product.actualScore ?? 'Chưa chấm'} {product.actualScore ? 'điểm' : ''}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-neutral-500 w-32 flex-shrink-0">Trạng thái:</span>
                    <span className="text-xs font-semibold text-neutral-700">
                      {product.status === 'da-duyet' ? 'Đã duyệt' : product.status === 'cho-duyet' ? 'Chờ duyệt' : 'Yêu cầu sửa'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-1">IV. Xác nhận</p>
                <div className="flex gap-8 mt-3">
                  <div className="text-center">
                    <div className="w-24 h-10 border-b border-neutral-300" />
                    <p className="text-[10px] text-neutral-500 mt-1">Người thực hiện</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-10 border-b border-neutral-300" />
                    <p className="text-[10px] text-neutral-500 mt-1">Trưởng đơn vị</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="px-8 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
            <p className="text-[10px] text-neutral-400">Tài liệu minh chứng - Hệ thống đánh giá KPI 3 cấp</p>
            <p className="text-[10px] text-neutral-400">Trang 1/1</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
