import { cn } from '@alexgodfrey/ui/lib/utils';
import { ProblemWordsImp } from '@alexgodfrey/web/lib/typing/problem';
import { useEffect, useState } from 'react';

export function Typing() {
  const [pw] = useState(new ProblemWordsImp());

  const [words, setWords] = useState(pw.sampleRun());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(words[currentIndex]);
  const [currentInput, setCurrentInput] = useState('');

  useEffect(() => {
    setCurrentWord(words[currentIndex]);
    setCurrentInput('');
  }, [currentIndex]);

  console.log('currentinput', currentInput);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen text-white bg-black">
      <div className="w-full max-w-lg gap-8 flex flex-col">
        <div className="flex items-center gap-2 w-full flex-wrap">
          {words.map((word, position) => {
            const isProblemWord = pw.isProblemWord(word);

            console.log({ word });
            return (
              <p
                key={word}
                className={cn(
                  {
                    underline: position === currentIndex,
                  },
                  { 'text-red-500 mr-1': isProblemWord },
                  'relative',
                )}
              >
                {word}
                {isProblemWord && (
                  <span className="absolute top-0 -right-[0.3rem] text-[10px]">
                    {pw.getProblemCtOfWord(word)}
                  </span>
                )}
              </p>
            );
          })}
        </div>

        <input
          value={currentInput ?? ''}
          onChange={(e) => {
            const newValue = e.target.value.trim();

            // correct
            if (newValue === currentWord) {
              setCurrentIndex(currentIndex + 1);
              if (pw.isProblemWord(currentWord)) {
                pw.decrementProblemWord(currentWord);
              }
            }

            let tracker = 0;
            while (tracker < newValue.length) {
              if (tracker >= currentWord.length || currentWord[tracker] !== newValue[tracker]) {
                pw.incrementProblemWord(currentWord);
                break;
              }
              tracker++;
            }

            setCurrentInput(newValue);
          }}
          className="border border-white"
          autoFocus
        />
      </div>
    </div>
  );
}
