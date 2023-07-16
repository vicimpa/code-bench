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
  boilerplate: IBlock;
}

export const run = makeSharedState(false);
export const topScore = makeSharedState(0);

export const segments = proxy<ISegments>({
  setup: { id: generate(4, 6) },
  boilerplate: { id: generate(4, 6) }
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

export const makeIdentifier = () => {
  return `__${generate(12)}__`;
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

    const ID_ID = makeIdentifier();
    const ID_CODE = makeIdentifier();
    const ID_BCODE = makeIdentifier();
    const ID_SCORE = makeIdentifier();
    const ID_NEED = makeIdentifier();
    const ID_DATENOW = makeIdentifier();
    const ID_SELFSEND = makeIdentifier();

    const runCode = `
      ${segments.setup.code ?? ''};
      const ${ID_DATENOW} = Date.now.bind(Date);
      const ${ID_SELFSEND} = self.postMessage.bind(self);

      try{
        ${blocks.map((block) => (`{
          const ${ID_ID} = ${JSON.stringify(block.id)};
          const ${ID_CODE} = ${JSON.stringify(block.code ?? '')};
          const ${ID_BCODE} = ${JSON.stringify(segments.boilerplate.code ?? '')};
 
          try {
            if(!${ID_BCODE}) {
              throw new Error("No boilerplate code");
            }
            if(!${ID_CODE}) {
              throw new Error("No block code");
            }
            
            ${block.code};
            
            let ${ID_SCORE} = 0;
            const ${ID_NEED} = ${ID_DATENOW}() + ${3000};
            while(${ID_DATENOW}() < ${ID_NEED}) {
              ${segments.boilerplate.code ?? ''};
              ${ID_SCORE}++;
            }
            
            ${ID_SELFSEND}({score: ${ID_SCORE}, id: ${ID_ID}});
          }catch(error) {
            ${ID_SELFSEND}({error, id: ${ID_ID}});
          }
        }`)).join('\n')}
      }finally{
        ${ID_SELFSEND}(null);
      }
    `;

    console.log(runCode);

    const blob = new Blob([`${runCode}`], {
      type: "text/plain",
    });

    const worker = new Worker(URL.createObjectURL(blob));
    topScore.state = 0;

    worker.onerror = (error) => {
      for (const block of blocks) {
        block.error = error.message;
        block.result = error.message;
        delete block.score;
      }

      run.state = false;
      worker.terminate();
    };

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
