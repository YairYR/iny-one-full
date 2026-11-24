import { Button, Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
import { SettingsIcon } from "lucide-react";
import clsx from "clsx";
import React from "react";
import { createPortal } from "react-dom";
import { autoUpdate, flip, offset, shift, useFloating, } from '@floating-ui/react';
import { useTranslations } from "next-intl";

export type ITool<T> = {
  key: string;
  text: string;
  disabled?: boolean;
  onClick: (e: React.MouseEvent, link: T) => void|Promise<void>;
  className?: string;
  icon?: React.ReactNode;
  disabledReason?: string;
}

interface Props<T = never> {
  tools: ITool<T>[];
  link: T;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  linkLabel?: string;
  contextMenuRequest?: { x: number; y: number; nonce: number } | null;
}

export function LinkTools<T>({ tools, link, buttonRef, linkLabel, contextMenuRequest }: Readonly<Props<T>>) {
  const t = useTranslations('DashboardPage');
  const localButtonRef = React.useRef<HTMLButtonElement>(null);
  const contextMenuRef = React.useRef<HTMLDivElement>(null);
  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
  const {
    x,
    y,
    strategy,
    refs,
    floatingStyles,
  } = useFloating({
    placement: 'bottom-end',
    middleware: [
      offset(8),
      flip(),   // si no hay espacio abajo, sube
      shift(),  // evita salirse del viewport
    ],
    whileElementsMounted: autoUpdate,
  });
  const setReference = refs.setReference;
  const setButtonRef = React.useCallback((element: HTMLButtonElement | null) => {
    setReference(element);
    localButtonRef.current = element;
    if (buttonRef) buttonRef.current = element;
  }, [setReference, buttonRef]);

  React.useEffect(() => {
    if (!contextMenuRequest) return;

    if (localButtonRef.current?.getAttribute("aria-expanded") === "true") {
      localButtonRef.current.click();
    }

    setContextMenuPosition({ x: contextMenuRequest.x, y: contextMenuRequest.y });
    setContextMenuOpen(true);
  }, [contextMenuRequest]);

  React.useLayoutEffect(() => {
    if (!contextMenuOpen || !contextMenuRef.current) return;

    const rect = contextMenuRef.current.getBoundingClientRect();
    setContextMenuPosition((position) => ({
      x: Math.min(position.x, Math.max(8, window.innerWidth - rect.width - 8)),
      y: Math.min(position.y, Math.max(8, window.innerHeight - rect.height - 8)),
    }));
  }, [contextMenuOpen]);

  React.useEffect(() => {
    if (!contextMenuOpen) return;

    const closeOnPointerDown = (event: PointerEvent) => {
      if (!contextMenuRef.current?.contains(event.target as Node)) setContextMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContextMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [contextMenuOpen]);

  return (
    <>
      <Menu as="div" className="relative shrink-0">
        <MenuButton
          ref={setButtonRef}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer">
          <span className="sr-only">{t('tools.openMenu')}{linkLabel ? `: ${linkLabel}` : ''}</span>
          <SettingsIcon aria-hidden="true"/>
        </MenuButton>

        <Portal>
          <MenuItems
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              ...floatingStyles
            }}
            transition
            className={
              "absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-surface py-1 shadow-lg outline outline-black/5 dark:outline-white/10 " +
              "transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 " +
              "data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            }
          >
            {tools.map((tool) => (
              <MenuItem key={`table_tool_${tool.key}`}>
                <Button
                  disabled={tool.disabled}
                  onClick={(e) => tool.onClick(e, link)}
                  className={clsx(
                    "block px-3 py-1 text-sm w-full text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden cursor-pointer " +
                    "disabled:cursor-not-allowed data-[disabled]:cursor-not-allowed disabled:line-through",
                    tool.className)}
                >
                  {tool.text}
                  {tool.disabled && tool.disabledReason && (
                    <span className="mt-0.5 block text-xs text-gray-400">{tool.disabledReason}</span>
                  )}
                </Button>
              </MenuItem>
            ))}
          </MenuItems>
        </Portal>
      </Menu>

      {contextMenuOpen && createPortal(
        <div
          ref={contextMenuRef}
          role="menu"
          aria-label={t('tools.openMenu')}
          className="fixed z-[70] w-48 rounded-md bg-surface py-1 shadow-lg outline outline-black/5 dark:outline-white/10"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          {tools.map((tool) => (
            <button
              key={`context_table_tool_${tool.key}`}
              type="button"
              role="menuitem"
              disabled={tool.disabled}
              onClick={(event) => {
                setContextMenuOpen(false);
                void tool.onClick(event, link);
              }}
              className={clsx(
                "block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-hidden",
                "disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through"
              )}
            >
              {tool.text}
              {tool.disabled && tool.disabledReason && (
                <span className="mt-0.5 block text-xs text-gray-400">{tool.disabledReason}</span>
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}