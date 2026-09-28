import { useState, type ChangeEvent } from 'react';

/**
 * Valor de un campo numérico que el usuario está escribiendo.
 *
 * Un campo vacío vale `min`, no cero. Esto importa por un detalle de JavaScript
 * que costó el bug: `Number('')` es `0`, y `0` es falsy, así que el patrón
 * `Number(texto) || min` convertía «vacío» en «mínimo». Como el estado se
 * repintaba en cada pulsación, borrar el campo para teclear otra cifra hacía
 * reaparecer el mínimo y lo escrito se pegaba detrás: al querer «5» salía «15».
 */
export function clampNumberInput(text: string, min: number): number {
  const parsed = Number(text);

  if (text.trim() === '' || Number.isNaN(parsed)) {
    return min;
  }

  return Math.max(min, parsed);
}

/**
 * Campo numérico que admite quedarse vacío mientras tiene el foco.
 *
 * El texto crudo manda durante la edición y se normaliza al salir del campo, en
 * vez de acotarse en cada pulsación. `value` es siempre un número válido, así
 * que los cálculos nunca ven el hueco.
 *
 * Sólo se notaba en móvil: el control numérico no pinta flechas ahí, así que
 * escribir es la única forma de cambiar el valor.
 */
export function useNumberField(initial: number, min: number) {
  const [text, setText] = useState(String(initial));
  const value = clampNumberInput(text, min);

  return {
    value,
    /** Escritura programática, para los presets y el botón de restablecer. */
    set: (next: number) => setText(String(next)),
    inputProps: {
      value: text,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setText(event.target.value),
      onBlur: () => setText(String(value)),
    },
  };
}
