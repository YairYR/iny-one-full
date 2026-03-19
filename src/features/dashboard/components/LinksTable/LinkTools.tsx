import { Button, Menu, MenuButton, MenuItem, MenuItems, Portal } from "@headlessui/react";
import { SettingsIcon } from "lucide-react";
import clsx from "clsx";
import React from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react';

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
}

export function LinkTools<T>({ tools, link }: Readonly<Props<T>>) {
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

  return (
    <Menu as="div" className="relative ml-3">
      <MenuButton
        ref={refs.setReference}
        className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer text-gray-400">
        <span className="absolute -inset-1.5"/>
        <span className="sr-only">Open link menu</span>
        <SettingsIcon/>
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
            "absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline outline-black/5 " +
            "transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 " +
            "data-enter:ease-out data-leave:duration-75 data-leave:ease-in" +
            "w-(--button-width)"
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