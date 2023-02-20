import { EditorList } from "components/EditorList";
import { BlocksRunner } from "data/blocks";
import { createRoot } from "react-dom/client";

createRoot(
  document.getElementById('root')!
).render(
  <>
    <BlocksRunner />
    <div>

    </div>
    <div className="main">
      <div className="editor-list">
        <EditorList />
      </div>

    </div>
  </>
);