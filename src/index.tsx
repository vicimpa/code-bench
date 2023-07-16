import { BlockResult } from "components/BlockResult";
import { EditorList } from "components/EditorList";
import { BlocksRunner } from "data/blocks";
import { createRoot } from "react-dom/client";

createRoot(
  document.getElementById('root')!
).render(
  <>
    <BlocksRunner />
    <div className="header">
      <h1>CodeBench</h1>
      <div className="grow"></div>
      <a href="https://github.com/RuStudentDev/code-bench">GitHub</a>
    </div>
    <div className="main">
      <div className="editor-list">
        <EditorList />
      </div>
      <div className="result">
        <div className="styki">
          <BlockResult />
        </div>
      </div>
    </div>
  </>
);