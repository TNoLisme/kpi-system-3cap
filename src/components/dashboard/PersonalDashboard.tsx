import { Card, SectionTitle, Badge } from '@/components/ui/Primitives';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GaugeChart } from '@/components/charts/Charts';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  TrendingUp, AlertTriangle, FileText, CheckCircle2, Clock, XCircle,
  Upload, Link as LinkIcon, Target,
} from 'lucide-react';
import {
  MY_PRODUCTS, MY_VIOLATIONS, MY_ALERTS, predictClassification,
  getClassificationLabel, getClassificationColor,
} from '@/data/mockData';

export function PersonalDashboard() {
  const completedProducts = MY_PRODUCTS.filter(p => p.status === 'da-duyet').length;
  const totalProducts = MY_PRODUCTS.length;
  const minRequired = 20;
  const currentScore = 78;
  const maxScore = 100;
  const predicted = predictClassification(currentScore);

  const statusConfig = {
    'cho-duyet': { label: 'Chờ duyệt', variant: 'yellow' as const, icon: <Clock size={14} /> },
    'da-duyet': { label: 'Đã duyệt', variant: 'green' as const, icon: <CheckCircle2 size={14} /> },
    'yeu-cau-sua': { label: 'Yêu cầu sửa', variant: 'red' as const, icon: <XCircle size={14} /> },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Target size={20} className="text-primary-600" />
            </div>
            <Badge variant="blue">Kỳ Q3/2026</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Tổng điểm tích lũy</p>
          <p className="text-3xl font-bold text-neutral-900">{currentScore}<span className="text-lg text-neutral-400 font-normal">/{maxScore}</span></p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-success-50">
              <TrendingUp size={20} className="text-success-600" />
            </div>
            <Badge variant="green">Dự báo</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Xếp loại dự kiến</p>
          <div className={`inline-flex px-3 py-1 rounded-lg text-lg font-bold ${getClassificationColor(predicted)}`}>
            {getClassificationLabel(predicted)}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-warning-50">
              <AlertTriangle size={20} className="text-warning-600" />
            </div>
            <Badge variant="red">{MY_VIOLATIONS.length} lỗi</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Vi phạm trong kỳ</p>
          <p className="text-3xl font-bold text-danger-600">{MY_VIOLATIONS.length}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <FileText size={20} className="text-primary-600" />
            </div>
            <Badge variant="blue">{completedProducts}/{totalProducts}</Badge>
          </div>
          <p className="text-sm text-neutral-500 mb-1">Sản phẩm đã nộp</p>
          <p className="text-3xl font-bold text-neutral-900">{totalProducts}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge Chart */}
        <Card className="p-6">
          <SectionTitle title="Tổng điểm & Dự báo xếp loại" subtitle="Điểm tích lũy hiện tại" icon={<Target size={18} />} />
          <div className="flex justify-center py-4">
            <GaugeChart value={currentScore} max={maxScore} label={`Xếp loại: ${getClassificationLabel(predicted)}`} size={220} />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-500 mb-2">Thang xếp loại:</p>
            <div className="flex flex-wrap gap-2">
              {(['A1', 'A2', 'B1', 'B2', 'C', 'D'] as const).map(c => (
                <Tooltip key={c} content={getClassificationLabel(c)}>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getClassificationColor(c)} ${c === predicted ? 'ring-2 ring-offset-1 ring-primary-400' : ''}`}>
                    {c}
                  </span>
                </Tooltip>
              ))}
            </div>
          </div>
        </Card>

        {/* Progress & Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <SectionTitle title="Tiến độ hoàn thành sản phẩm" subtitle={`Số lượng tối thiểu: ${minRequired} sản phẩm`} icon={<FileText size={18} />} />
            <ProgressBar value={totalProducts} max={minRequired} label="Sản phẩm đã nộp" color={totalProducts >= minRequired ? 'success' : 'warning'} height="lg" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-success-50">
                <p className="text-2xl font-bold text-success-600">{completedProducts}</p>
                <p className="text-xs text-neutral-500">Đã duyệt</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-warning-50">
                <p className="text-2xl font-bold text-warning-600">{MY_PRODUCTS.filter(p => p.status === 'cho-duyet').length}</p>
                <p className="text-xs text-neutral-500">Chờ duyệt</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-danger-50">
                <p className="text-2xl font-bold text-danger-600">{MY_PRODUCTS.filter(p => p.status === 'yeu-cau-sua').length}</p>
                <p className="text-xs text-neutral-500">Yêu cầu sửa</p>
              </div>
            </div>
          </Card>

          {/* Alert Box */}
          <Card className="p-6">
            <SectionTitle title="Cảnh báo vi phạm" subtitle="Các lỗi bị ghi nhận trong kỳ" icon={<AlertTriangle size={18} />} />
            <div className="space-y-3">
              {MY_ALERTS.map(alert => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.severity === 'danger' ? 'bg-danger-50 border-danger-200' : 'bg-warning-50 border-warning-200'}`}>
                  <AlertTriangle size={18} className={alert.severity === 'danger' ? 'text-danger-600 mt-0.5' : 'text-warning-600 mt-0.5'} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-800">{alert.title}</p>
                    <p className="text-sm text-neutral-600">{alert.detail}</p>
                    <p className="text-xs text-neutral-400 mt-1">Ghi nhận: {alert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Product List / Kanban */}
      <Card className="p-6">
        <SectionTitle title="Trạng thái sản phẩm đã nộp" subtitle="Theo dõi duyệt sản phẩm" icon={<FileText size={18} />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['cho-duyet', 'da-duyet', 'yeu-cau-sua'] as const).map(status => {
            const items = MY_PRODUCTS.filter(p => p.status === status);
            const cfg = statusConfig[status];
            return (
              <div key={status} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  {cfg.icon}
                  <span className="text-sm font-semibold text-neutral-700">{cfg.label}</span>
                  <Badge variant={cfg.variant}>{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-neutral-400 text-center py-4">Không có sản phẩm</p>
                  ) : items.map(item => (
                    <div key={item.id} className="bg-white rounded-lg border border-neutral-200 p-3 hover:shadow-sm transition-shadow">
                      <p className="text-sm font-medium text-neutral-800 truncate">{item.category}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.categoryCode} - Đóng góp {item.contribution}%</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {item.evidenceType === 'file' ? <Upload size={12} className="text-neutral-400" /> : <LinkIcon size={12} className="text-neutral-400" />}
                        <span className="text-xs text-neutral-400 truncate">{item.evidenceName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
