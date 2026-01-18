import { useState } from "react";

export default function TaggingTab({setLoading}: {setLoading: (isLoading: boolean) => void}) {
  const [restrictSelectionTo, setRestrictSelectionTo] = useState("");
  const [taggingTagType, setTaggingTagType] = useState("text");

  const executeSelectWithinSelection = () => {
    setLoading(true);
    parent.postMessage(
      {
        pluginMessage: {
          type: "select-selected-tagged",
          restrictTo: restrictSelectionTo,
        },
      },
      "*",
    );
  };

  const executeSelectAll = () => {
    setLoading(true);
    parent.postMessage(
      {
        pluginMessage: {
          type: "select-all-tagged",
          restrictTo: restrictSelectionTo,
        },
      },
      "*",
    );
  };

  const executeDetagSelection = () => {
    setLoading(true);
    parent.postMessage({ pluginMessage: { type: "detag-selected" } }, "*");
  };

    const executeTagSelection = () => {
    setLoading(true);
      parent.postMessage(
        { pluginMessage: { type: "tag-selection", tag: taggingTagType } },
        "*",
      );
    }

  return (
    <div className="tab">
      <div>
        <h2>Element Tagging</h2>

        <p>Select tagged elements:</p>
        <div style={{ width: "max-content" }}>
          <select
            onChange={(e) => setRestrictSelectionTo(e.target.value)}
            value={restrictSelectionTo}
            style={{ width: "100%", marginBottom: "5px" }}
          >
            <option value="">All</option>
            <option value="text">Only Text</option>
            <option value="image">Only Image</option>
            <option value="shape">Only Shape</option>
          </select>
          <br />
          <button onClick={executeSelectWithinSelection}>
            Select within selection
          </button>
          <button onClick={executeSelectAll}>Select all</button>
        </div>

        <p>Tag selection as:</p>
        <div>
          <select onChange={e => setTaggingTagType(e.target.value)} value={taggingTagType}>
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="shape">Shape</option>
          </select>
          <button onClick={executeTagSelection}>Confirm</button>
        </div>
      </div>
      <div style={{ marginTop: "auto" }}>
        <p>Danger:</p>
        <button onClick={executeDetagSelection} className="danger">
          Detag selection
        </button>
      </div>
    </div>
  );
}

