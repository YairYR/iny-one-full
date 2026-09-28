/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { clampNumberInput, useNumberField } from '@/features/piscolas/hooks/useNumberField';
import type { ChangeEvent } from 'react';

function escribir(valor: string) {
  return { target: { value: valor } } as ChangeEvent<HTMLInputElement>;
}

/**
 * El bug: la calculadora guardaba un **número** y lo acotaba en cada pulsación.
 * Al borrar el campo, `Number('') || min` devolvía el mínimo, el estado se
 * repintaba, y lo que se tecleaba después se pegaba detrás: al querer «5» salía
 * «15». Sólo se veía en móvil, donde `input[type=number]` no pinta flechas y
 * escribir es la única forma de cambiar el valor.
 *
 * Ojo con dónde se prueba esto: el cálculo de acotado da lo mismo antes y
 * después del arreglo. Lo que cambia es que el estado guarda el **texto**, así
 * que el campo puede verse vacío. Estas son las pruebas que distinguen una cosa
 * de la otra.
 */
describe('useNumberField', () => {
  it('deja el campo vacío mientras se escribe, en vez de repintar el mínimo', () => {
    const { result } = renderHook(() => useNumberField(10, 1));

    act(() => result.current.inputProps.onChange(escribir('')));

    expect(result.current.inputProps.value).toBe('');
    // El cálculo nunca ve el hueco: sigue teniendo un número válido.
    expect(result.current.value).toBe(1);
  });

  /**
   * La secuencia exacta que reportó el usuario. Hay que reproducir cómo teclea
   * un navegador: la pulsación se añade a lo que el campo muestra en ese
   * momento. Si tras borrar el campo muestra «1», teclear «5» produce un
   * `target.value` de «15», no de «5». Pasarle «5» directamente al `onChange`
   * es una prueba que no puede fallar.
   */
  it('no antepone el mínimo a lo que se teclea tras borrar', () => {
    const { result } = renderHook(() => useNumberField(10, 1));

    act(() => result.current.inputProps.onChange(escribir('')));

    const loQueSeVe = result.current.inputProps.value;
    act(() => result.current.inputProps.onChange(escribir(`${loQueSeVe}5`)));

    expect(result.current.inputProps.value).toBe('5');
    expect(result.current.value).toBe(5);
  });

  it('normaliza al salir del campo', () => {
    const { result } = renderHook(() => useNumberField(10, 1));

    act(() => result.current.inputProps.onChange(escribir('')));
    act(() => result.current.inputProps.onBlur());

    expect(result.current.inputProps.value).toBe('1');
  });

  it('acepta escritura programática, para presets y restablecer', () => {
    const { result } = renderHook(() => useNumberField(60, 30));

    act(() => result.current.set(70));

    expect(result.current.inputProps.value).toBe('70');
    expect(result.current.value).toBe(70);
  });
});

describe('clampNumberInput', () => {
  it('respeta el cero cuando el mínimo lo permite', () => {
    expect(clampNumberInput('0', 0)).toBe(0);
  });

  it('eleva al mínimo lo que queda por debajo', () => {
    expect(clampNumberInput('0', 1)).toBe(1);
    expect(clampNumberInput('-5', 1)).toBe(1);
    expect(clampNumberInput('12', 30)).toBe(30);
  });

  it('cae al mínimo ante texto que no es un número', () => {
    expect(clampNumberInput('abc', 1)).toBe(1);
    expect(clampNumberInput('', 1)).toBe(1);
  });
});
