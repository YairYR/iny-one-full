'use client';

import React, { useState } from 'react';
import {
  useFloating,
  useHover,
  useFocus,
  useRole,
  useInteractions,
  offset,
  flip,
  shift,
  autoUpdate,
  arrow,
  FloatingArrow,
} from '@floating-ui/react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = React.useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
    placement: 'top',
  });

  const hover = useHover(context, {
    delay: { open: 300, close: 0 },
  });
  const focus = useFocus(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    role,
  ]);

  return (
    <>
      <span
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-flex items-center cursor-help"
      >
        {children || <HelpCircle className="h-4 w-4 text-gray-400 hover:text-indigo-600 transition-colors" />}
      </span>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 max-w-xs px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg"
        >
          <FloatingArrow ref={arrowRef} context={context} fill="#111827" />
          {content}
        </div>
      )}
    </>
  );
}