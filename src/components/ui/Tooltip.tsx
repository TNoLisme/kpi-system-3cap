import { type ReactNode, useState, useId } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  maxWidth?: number;
}

export function Tooltip({ content, children, side = 'top', maxWidth = 300 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const tooltipId = useId();

  return (
    <div
      tabIndex={0}
      className="relative inline-flex focus:outline-none"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      aria-describedby={show ? tooltipId : undefined}
    >
      {children}
      {show && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`absolute z-50 px-3 py-2.5 text-xs font-medium text-white bg-neutral-900 rounded-lg shadow-lg pointer-events-none animate-fade-in ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          style={{ left: '50%', transform: 'translateX(-50%)', maxWidth: `${maxWidth}px`, width: 'max-content', whiteSpace: 'normal', lineHeight: '1.5' }}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-neutral-900 rotate-45 ${side === 'top' ? 'top-full' : 'bottom-full'}`}
            style={{ left: '50%', transform: 'translateX(-50%)', marginTop: side === 'top' ? '-4px' : '0', marginBottom: side === 'bottom' ? '-4px' : '0' }}
          />
        </div>
      )}
    </div>
  );
}
