import { random } from "./math";

const A_CHAR = 'A'.charCodeAt(0);
const a_CHAR = 'a'.charCodeAt(0);
const DELTA = 'Z'.charCodeAt(0) - A_CHAR;

export const generate = (length = 8, time = 0) => {
  return Array.from(
    { length },
    v => (String.fromCharCode(random() * DELTA | 0 + (random() > 0.5 ? A_CHAR : a_CHAR)))
  ).join('') + (time > 0 ? '_' + `${Date.now()}`.slice(-time) : '');
};