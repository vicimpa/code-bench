import MonacoEditor from "@monaco-editor/react";
import { getName, IBlock, removeBlock, useRun } from "data/blocks";
import { useSize } from "lib/useSize";
import { MouseEvent, useCallback, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";

interface IEditorProps {
  block: IBlock;
  name?: string;
  defaultShow?: boolean;
}

export const Editor = ({ block, name, defaultShow }: IEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width] = useSize(ref);
  const run = useRun();
  const onInput = useCallback((e: MouseEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      block.name = e.target.value;
    }
  }, []);

  const toggleShow = useCallback(() => {
    block.show = !block.show;
  }, []);

  useEffect(() => {
    if (typeof defaultShow === 'boolean')
      block.show = defaultShow;
  }, [defaultShow]);

  useSnapshot(block);

  return (
    <div className="editor">
      {run ? <div className="block" /> : null}
      <p>
        {name ? (
          <input defaultValue={name} readOnly />
        ) : (
          <input value={getName(block)} onInput={onInput} />
        )}

        <button onClick={toggleShow}>{block.show ? 'Hide' : 'Show'}</button>

        {!name && (
          <button onClick={() => removeBlock(block.id)}>Remove</button>
        )}

        {block.run ? 'Running...' : `Score: ${block.score ?? 0}`}
      </p>
      <div ref={ref} style={{ height: block.show ? 300 : 0 }}>
        <div style={{ position: 'absolute' }}
          className={!block.show && 'hidden' || ''}>
          <MonacoEditor
            key={block.id}
            height={'300px'}
            width={`${width}px`}
            defaultLanguage="javascript"
            value={block.code}
            options={{ tabSize: 2 }}
            onChange={code => block.code = code}
            theme="vs-dark"
          />
        </div>
      </div>
    </div>
  );
};