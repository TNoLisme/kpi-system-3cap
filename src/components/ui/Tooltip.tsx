import { type ReactNode, useState } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  maxWidth?: number;
}

export function Tooltip({ content, children, side = 'top', maxWidth = 300 }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
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
