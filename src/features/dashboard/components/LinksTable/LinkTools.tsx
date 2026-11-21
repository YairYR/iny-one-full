import { Button, Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
import { SettingsIcon } from "lucide-react";
import clsx from "clsx";
import React from "react";
import { autoUpdate, flip, offset, shift, useFloating, } from '@floating-ui/react';
import { useTranslations } from "next-intl";

export type ITool<T> = {
  key: string;
  text: string;
  disabled?: boolean;
  onClick: (e: React.MouseEvent, link: T) => void|Promise<void>;
  className?: string;
  icon?: React.ReactNode;
}

interface Props<T = never> {
  tools: ITool<T>[];
  link: T;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  linkLabel?: string;
}

export function LinkTools<T>({ tools, link, buttonRef, linkLabel }: Readonly<Props<T>>) {
  const t = useTranslations('DashboardPage');
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
    if (buttonRef) buttonRef.current = element;
  }, [setReference, buttonRef]);

  return (
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
            "absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 " +
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
              </Button>
            </MenuItem>
          ))}
        </MenuItems>
      </Portal>
    </Menu>
  )
}