import { Popover, PopoverButton, PopoverPanel, type PopoverPanelProps } from "@headlessui/react";
import { InfoIcon } from "lucide-react";
import { type ReactNode } from "react";

interface Props {
  keys: string;
  messages: ReactNode[];
  anchor?: PopoverPanelProps['anchor'];
}

export default function InfoPopover({ keys, messages, anchor }: Readonly<Props>) {
  return (
    <Popover className="relative inline-block">
      <PopoverButton
        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
        <InfoIcon size={14} strokeWidth={2} />
      </PopoverButton>
      <PopoverPanel
        transition
        anchor={anchor}
        className="absolute z-50 mt-2
                     w-max max-w-xs bg-white border shadow-lg rounded-lg p-3
                     text-sm text-gray-700">
        {messages.map((text, i) => (
          <p key={`info-popover-${keys}-${i}`}>{text}</p>
        ))}
      </PopoverPanel>
    </Popover>
  )
}