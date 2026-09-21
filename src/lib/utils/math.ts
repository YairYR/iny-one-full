/*
  * Returns a random integer between min (inclusive) and max (inclusive).
 */
export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
