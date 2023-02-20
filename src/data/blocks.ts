import { generate } from "lib/generate";
import { makeSharedState } from "lib/sharedState";
import { createElement, Fragment, useLayoutEffect } from "react";
import { proxy, useSnapshot } from "valtio";

const TIMEOUT = 5000;

export interface IBlock {
  id: string;
  result?: string;
  name?: string;
  code?: string;
  show?: boolean;
}

export interface ISegments {
  setup: IBlock;
  bollerplate: IBlock;
}

export const run = makeSharedState(false);

export const segments = proxy<ISegments>({
  setup: { id: generate(4, 6), code: '' },
  bollerplate: { id: generate(4, 6), code: 'myTest(2)' }
});

export const blocks = proxy<IBlock[]>([
  { id: generate(4, 6), code: 'const myTest = (n = 0) => n + n' }
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

export const getName = (block: IBlock) => {
  const index = blocks.findIndex(e => e.id === block.id);
  return block.name || `Code block ${index + 1}`;
};

export const runAll = () => {
  for (const block of blocks)
    block.result = 'Running...';

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
          let id = ${JSON.stringify(block.id)};
          
          try {
            ${block.code};
            
            let score = 0;
            let need = Date.now() + ${TIMEOUT - 1000};
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
        }

        if ('error' in data) {
          findBlock.result = `${data.error.message || data.error}`;
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