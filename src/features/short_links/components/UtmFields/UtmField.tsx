import type React from "react";
import {Input, Label} from "@headlessui/react";
import {Tooltip} from "@/components/Tooltip/Tooltip";

interface Props {
    id: string;
    name: string;
    value: string;
    label?: React.ReactNode;
    placeholder?: string;
    tooltip?: React.ReactNode;
    className?: string;
    maxLength?: number;
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UtmField({ id, name, label, value, placeholder, tooltip, className, maxLength, onChange }: Readonly<Props>) {
    return <>
        {(label || tooltip) && (
            <div className="flex items-center gap-1 mb-1">
                {label && <Label htmlFor={id} className="text-xs text-gray-600">{label}</Label>}
                {tooltip && <Tooltip content={tooltip}/>}
            </div>
        )}
        <Input
            type="text"
            name={name}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            autoComplete="off"
            className={className ? className : "px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors w-full"}
        />
    </>;
}