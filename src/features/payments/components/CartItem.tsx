import type React from "react";

interface Props {
  item: ICartItem;
  onClose?: (ev:React.MouseEvent, item: ICartItem) => void;
}

export function CartItem({ item, onClose }: Readonly<Props>) {
  const closable = onClose !== undefined;
  const onClick = (ev: React.MouseEvent) => onClose?.(ev, item);

  return (
    <div className="flex items-start gap-4 border rounded-xl p-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500">{item.description}</p>

        <div className="mt-3">
          <span className="text-gray-700 font-medium">{item.symbol}{item.price} / {item.interval}</span>
        </div>
      </div>

      {/* Botón eliminar */}
      {closable && (<button className="text-red-500 hover:text-red-600 transition" onClick={onClick}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor"
             strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>)}
    </div>
  )
}

export interface ICartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  symbol: string;
  interval: string;
}