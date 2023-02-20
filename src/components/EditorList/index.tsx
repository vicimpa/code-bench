import { Editor } from "components/Editor";
import { appendBlock, blocks, run, runAll, segments } from "data/blocks";
import { useSnapshot } from "valtio";


export const EditorList = () => {
  useSnapshot(blocks);

  return (
    <>
      <Editor name="Setup block" block={segments.setup} />
      <Editor name="Bollerplate block" block={segments.bollerplate} />
      {blocks.map(block => (
        <Editor key={block.id} defaultShow {...{ block }} />
      ))}
      <button onClick={appendBlock}>New block</button>
    </>
  );
};