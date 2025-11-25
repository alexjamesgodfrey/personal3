import { words } from './words';

export function sample<T>(items: T[], ct: number) {
  const start = parseInt((Math.random() * items.length).toFixed(0));
  const sub = items.slice(start, start + ct);
  return sub;
}

export function sampleAllWords(ct: number) {
  return sample(words, ct);
}

export function sampleProblemWords(words: number) {}
