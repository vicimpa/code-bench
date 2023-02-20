import { blocks, getName, IBlock, run, runAll, topScore } from "data/blocks";
import { useSnapshot } from "valtio";

export const BlockResult = () => {
  const [isRun] = run.useState();
  useSnapshot(blocks);

  const complated = blocks
    .filter(e => typeof e.score === 'number')
    .sort((a, b) => b.score! - a.score!);

  const errored = blocks
    .filter(e => typeof e.error === 'object');

  const waiting = blocks
    .filter(e => (
      !complated.find(j => j.id === e.id) &&
      !errored.find(j => j.id === e.id)
    ));

  const outputBlocks = (e: IBlock[], showRun = false) => {
    return (
      <>
        {e.map((block, i) => {
          const persent = `${(block.score! / topScore.state * 100 * 100 | 0) / 100}%`;
          const style = {
            ['--score']: persent
          } as any;

          return (
            <div key={block.id} className="block">
              <p>{i + 1}) {getName(block, true)} <i>{showRun && !i ? '♛' : ''}</i></p>
              {showRun ? (
                <div style={style} className="persent">
                  <span>{persent}</span>
                </div>
              ) : ''}
              <pre>
                {block.result}
              </pre>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      {complated.length && (
        <div>
          <p>Complated:</p>
          {outputBlocks(complated, true)}
        </div>
      ) || null}
      {errored.length && (
        <div style={{ color: '#f00' }}>
          <p>Errored:</p>
          {outputBlocks(errored)}
        </div>
      ) || null}
      {waiting.length && (
        <div>
          <p>Waiting:</p>
          {outputBlocks(waiting)}
        </div>
      ) || null}
      <button disabled={isRun} onClick={runAll}>▶ Run all</button>
    </>
  );
};