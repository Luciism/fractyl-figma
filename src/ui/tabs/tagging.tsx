import { useState } from "react";

export default function TaggingTab({
    setLoading,
}: {
    setLoading: (isLoading: boolean) => void;
}) {
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
    };

    return (
        <div className="tab">
            <h2>Element Tagging</h2>

            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="tag-restriction-select">Select Tagged Elements</label>
                <select
                    id="tag-restriction-select"
                    onChange={(e) => setRestrictSelectionTo(e.target.value)}
                    value={restrictSelectionTo}
                >
                    <option value="">All</option>
                    <option value="text">Only Text</option>
                    <option value="image">Only Image</option>
                    <option value="shape">Only Shape</option>
                    <option value="custom">Only Custom</option>
                </select>
                <button onClick={executeSelectWithinSelection}>
                    Select within selection
                </button>
                <button onClick={executeSelectAll}>Select all</button>
            </form>

            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="tag-selection-as-select">Tag Selection As</label>
                <select
                    id="tag-selection-as-select"
                    onChange={(e) => setTaggingTagType(e.target.value)}
                    value={taggingTagType}
                >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="shape">Shape</option>
                    <option value="custom">Custom</option>
                </select>
                <button onClick={executeTagSelection}>Confirm</button>
            </form>
            <form style={{ marginTop: "auto" }} onSubmit={(e) => e.preventDefault}>
                <label htmlFor="detag-button">Danger</label>
                <button
                    onClick={executeDetagSelection}
                    className="danger"
                    id="detag-selection"
                >
                    Detag selection
                </button>
            </form>
        </div>
    );
}
