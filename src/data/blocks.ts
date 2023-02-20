import { generate } from "lib/generate";
import { createElement, Fragment, useLayoutEffect } from "react";
import { proxy, useSnapshot } from "valtio";

const TIMEOUT = 5000;

export interface IBlock {
  id: string;
  run?: boolean;
  error?: string;
  score?: number;
  name?: string;
  code?: string;
  show?: boolean;
}

export interface ISegments {
  setup: IBlock;
  bollerplate: IBlock;
}

export const segments = proxy<ISegments>({
  setup: { id: generate(4, 6), code: '' },
  bollerplate: { id: generate(4, 6), code: 'myTest(2)' }
});

export const blocks = proxy<IBlock[]>([
  { id: generate(4, 6), code: 'const myTest = (n = 0) => n + n' }
]);

export const useRun = () => {
  return !!useSnapshot(blocks).filter(e => e.run).length;
};

export const appendBlock = () => {
  const id = generate(6, 10);
  console.log(id);
  blocks.push({ id });
};

export const removeBlock = (id: string) => {
  const index = blocks.findIndex(e => e.id === id);
  if (index !== -1) blocks.splice(index, 1);
};

export const getName = (block: IBlock) => {
  const index = blocks.findIndex(e => e.id === block.id);
  return block.name || `Code block ${index + 1}`;
};

export const runAll = () => {
  for (const block of blocks)
    block.run = true;
};


const Runner = ({ block }: { block: IBlock; }) => {
  useSnapshot(block);

  useLayoutEffect(() => {
    const { code = '', run } = block;
    if (!run) return;
    const runCode = `
      ${segments.setup.code ?? ''};
      
      ${code};

      let score = 0;
      let need = Date.now() + ${TIMEOUT - 1000};

      while(Date.now() < need) {
        ${segments.bollerplate.code ?? ''};
        score++;
      }
      
      self.postMessage(score);
    `;
    const worker = new Worker(`data:,${runCode}`);
    const stop = () => {
      block.run = false;
      worker.terminate();
      clearTimeout(timer);
    };

    const timer = setTimeout(() => {
      stop();
      block.error = `Timeout ${TIMEOUT}ms`;
    }, TIMEOUT);

    worker.onmessage = ({ data }) => {
      console.log(data);
      if (typeof data === 'number')
        block.score = data;
      else
        delete block.score;
      stop();
    };

    worker.onerror = ({ message, error }) => {
      delete block.score;
      block.error = `${error || message}`;
      stop();
    };

    return stop;
  }, [!!block.run]);

  return null;
};

export const BlocksRunner = () => {
  useSnapshot(blocks);

  return createElement(
    Fragment,
    {},
    blocks.map(block => (
      createElement(
        Runner,
        { block, key: block.id }
      )
    ))
  );
};