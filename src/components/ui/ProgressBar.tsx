interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  height?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value, max, label, showValue = true, color = 'primary', height = 'md',
}: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);

  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-neutral-600">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-neutral-700">
              {value}<span className="text-neutral-400 font-normal">/{max}</span>
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${heights[height]} bg-neutral-200 rounded-full overflow-hidden`}>
        <div
          className={`${colors[color]} ${heights[height]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
