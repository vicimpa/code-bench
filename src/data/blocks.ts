import { generate } from "lib/generate";
import { makeSharedState } from "lib/sharedState";
import { createElement, Fragment, useLayoutEffect } from "react";
import { proxy, useSnapshot } from "valtio";

const TIMEOUT = 5000;

export interface IBlock {
  id: string;
  result?: string;
  name?: string;
  score?: number;
  error?: string;
  code?: string;
  show?: boolean;
}

export interface ISegments {
  setup: IBlock;
  bollerplate: IBlock;
}

export const run = makeSharedState(false);
export const topScore = makeSharedState(0);

export const segments = proxy<ISegments>({
  setup: { id: generate(4, 6) },
  bollerplate: { id: generate(4, 6) }
});

export const blocks = proxy<IBlock[]>([
  { id: generate(4, 6) },
  { id: generate(4, 6) }
]);

export const appendBlock = () => {
  const id = generate(6, 10);
  console.log(id);
  blocks.push({ id });
};

export const removeBlock = (id: string) => {
  const index = blocks.findIndex(e => e.id === id);
  if (index !== -1) blocks.splice(index, 1);
};

export const getName = (block: IBlock, noName = false) => {
  const index = blocks.findIndex(e => e.id === block.id);
  if (noName)
    return block.name || `Code block ${index + 1}`;

  return block.name ?? `Code block ${index + 1}`;
};

export const runAll = () => {
  for (const block of blocks) {
    delete block.error;
    delete block.score;
    block.result = 'Running...';
  }
  topScore.state = 0;
  run.state = true;
};

export const BlocksRunner = () => {
  const [isRun] = run.useState();
  useSnapshot(blocks);

  useLayoutEffect(() => {
    if (!isRun) return;
    const runCode = `
      ${segments.setup.code ?? ''};

      try{
        ${blocks.map((block) => (`{
          const id = ${JSON.stringify(block.id)};
          const code = ${JSON.stringify(block.code ?? '')};
          const bcode = ${JSON.stringify(segments.bollerplate.code ?? '')};

        
          try {
            if(!bcode) {
              throw new Error("No bollerplate code");
            }
            if(!code) {
              throw new Error("No block code");
            }
            
            ${block.code};
            
            let score = 0;
            let need = Date.now() + ${1000};
            while(Date.now() < need) {
              ${segments.bollerplate.code ?? ''};
              score++;
            }
            
            self.postMessage({score, id});
          }catch(error) {
            self.postMessage({error, id});
          }
        }`)).join('\n')}
      }finally{
        self.postMessage(null);
      }
    `;

    const blob = new Blob([`${runCode}`], {
      type: "text/plain",
    });

    const worker = new Worker(URL.createObjectURL(blob));
    topScore.state = 0;
    worker.onmessage = ({ data }) => {
      if (data === null) {
        run.state = false;
        return;
      }
      if (typeof data === 'object' && !Array.isArray(data)) {
        const findBlock = blocks.find(e => e.id === data.id);
        if (!findBlock) return;

        if ('score' in data) {
          findBlock.result = `Score: ${data.score}`;
          findBlock.score = data.score;
          if (data.score > topScore.state)
            topScore.state = data.score;
        }

        if ('error' in data) {
          findBlock.result = `${data.error.message || data.error}`;
          findBlock.error = data.error;
          console.error(data.error);
        }
      }

      return () => {
        worker.terminate();
      };
    };

  }, [isRun]);

  return null;
};