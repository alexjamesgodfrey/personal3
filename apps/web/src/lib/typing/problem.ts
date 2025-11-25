import { sample } from './sampling';
import { words } from './words';

interface ProblemWords {
  minProblemWordsPerRun: number;
  maxProblemWordsPerRun: number;
  nonProblemWordsPerRun: number;

  storageKey: string;
  getProblemWordsWithCount: () => Record<string, number>;
  getProblemWords: () => string[];
  isProblemWord: (word: string) => boolean;
  getProblemCtOfWord: (word: string) => boolean;
  incrementProblemWord: (word: string) => void;
  decrementProblemWord: (word: string) => void;

  sample: (words: string[], ct: number) => string[];
  sampleAllWords: (ct: number) => string[];
  sampleProblemWords: () => string[];
  sampleRun: () => string[];
}

export class ProblemWordsImp implements ProblemWords {
  allWords = words;
  minProblemWordsPerRun = 5;
  maxProblemWordsPerRun = 10;
  nonProblemWordsPerRun = 35;

  storageKey = 'problemWords';
  sample = sample;

  constructor() {}

  getProblemWordsWithCount() {
    return JSON.parse(localStorage.getItem('problemWords') ?? '{}');
  }

  getProblemWords() {
    const problemWords = this.getProblemWordsWithCount();
    return Object.keys(problemWords);
  }

  isProblemWord(word: string) {
    const problemWords = this.getProblemWordsWithCount();
    return (problemWords[word] ?? 0) > 0;
  }

  getProblemCtOfWord(word: string) {
    const problemWords = this.getProblemWordsWithCount();
    return problemWords[word] ?? 0;
  }

  incrementProblemWord(word: string) {
    const problemWords = this.getProblemWordsWithCount();
    problemWords[word] = (problemWords[word] ?? 0) + 1;
    localStorage.setItem(this.storageKey, JSON.stringify(problemWords));
  }

  decrementProblemWord(word: string) {
    const problemWords = this.getProblemWordsWithCount();
    problemWords[word] = Math.max(0, problemWords[word] - 1);
    if (problemWords[word] === 0) {
      delete problemWords[word];
    }
    localStorage.setItem(this.storageKey, JSON.stringify(problemWords));
  }

  sampleAllWords(subtractCt?: number) {
    return this.sample(words, this.nonProblemWordsPerRun - (subtractCt ?? 0));
  }

  sampleProblemWords() {
    const problemWords = this.getProblemWords();
    if (problemWords.length <= this.minProblemWordsPerRun) {
      return problemWords;
    }

    const realMax = Math.min(this.maxProblemWordsPerRun, problemWords.length);
    const rand =
      this.minProblemWordsPerRun + Math.random() * (realMax - this.minProblemWordsPerRun);
    const sampled = this.sample(problemWords, rand);
    return sampled;
  }

  sampleRun() {
    const problemWords = this.sampleProblemWords();
    const allWords = this.sampleAllWords(problemWords.length);

    return [...problemWords, ...allWords];
  }
}

const w = new ProblemWordsImp();
