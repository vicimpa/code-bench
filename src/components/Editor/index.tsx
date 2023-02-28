import MonacoEditor from "@monaco-editor/react";
import { getName, IBlock, removeBlock, run } from "data/blocks";
import { useSize } from "lib/useSize";
import { FocusEventHandler, MouseEvent, useCallback, useEffect, useRef } from "react";
import { useSnapshot } from "valtio";

interface IEditorProps {
  block: IBlock;
  name?: string;
  defaultShow?: boolean;
}

export const Editor = ({ block, name, defaultShow }: IEditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width] = useSize(ref);
  const [isRun] = run.useState();
  const onInput = useCallback((e: MouseEvent<HTMLInputElement>) => {
    if (e.target instanceof HTMLInputElement) {
      block.name = e.target.value;
    }
  }, []);

  const toggleShow = useCallback(() => {
    block.show = !block.show;
  }, []);

  const defaultName = useCallback<FocusEventHandler>((e) => {
    if (e.target instanceof HTMLInputElement) {
      if (!e.target.value) {
        e.target.value = getName(block, true);
        block.name = getName(block, true);
      }
    }
  }, [block]);

  useEffect(() => {
    if (typeof defaultShow === 'boolean' && typeof block.show !== 'boolean')
      block.show = defaultShow;
  }, [defaultShow]);

  useSnapshot(block);

  const titleMap:{[index: string]:any} = {
    'Setup block': 'launch before every test',
    'Boilerplate block': 'executes before every block (part of benchmark). Using for data init'
  }
  return (
    <div className="editor">
      {isRun ? <div className="block" /> : null}
      <div className="head" title={name ? titleMap[name] : ''}>
        <button onClick={toggleShow}>{block.show ? '↑' : '↓'}</button>

        {name ? (
          <input defaultValue={name} readOnly />
        ) : (
          <input value={getName(block)} onBlur={defaultName} onInput={onInput} />
        )}

        <div style={{ flexGrow: 1 }} />
        {!name && (
          <button onClick={() => removeBlock(block.id)}>🗑</button>
        )}
      </div>
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
