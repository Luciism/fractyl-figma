import { FormEvent, useState, useEffect } from "react";
import { NodePluginData } from "../../shared/types";

export default function ShapesTab({
    setLoading,
}: {
    setLoading: (isLoading: boolean) => void;
}) {
    const [elementIdInput, setElementIdInput] = useState("");
    const [widthMode, setWidthMode] = useState("fixed");
    const [heightMode, setHeightMode] = useState("fixed");

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "selection-changed") {
                const selectedNodes: NodePluginData[] = msg.selectedNodes;
                const selectedShapeNodes = selectedNodes.filter(node => node.tag === "shape");

                console.log(selectedShapeNodes);

                if (selectedShapeNodes[0]) {
                    const node = selectedShapeNodes[0];
                    setElementIdInput(node.id || "");
                    setWidthMode(node.attributes.widthMode);
                    setHeightMode(node.attributes.heightMode);
                }
            }
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        parent.postMessage(
            {
                pluginMessage: {
                    type: "update-selection-shape-data",
                    shapeNodeData: {
                        id: elementIdInput,
                        attributes: {
                            widthMode,
                            heightMode
                        }
                    },
                },
            },
            "*",
        );
    };

    return (
        <div className="tab">
            <div>
                <h2>Shape Properties</h2>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="element-id-input">Element ID</label>
                    <input
                        type="text"
                        placeholder="none"
                        id="element-id-input"
                        value={elementIdInput}
                        onChange={(e) => setElementIdInput(e.target.value)}
                    />

                    <label htmlFor="width-mode-select">Width Mode</label>
                    <select
                        id="width-mode-select"
                        value={widthMode}
                        onChange={(e) => setWidthMode(e.target.value)}
                    >
                        <option value="fixed">Fixed</option>
                        <option value="dynamic">Dynamic</option>
                    </select>

                    <label htmlFor="height-mode-select">Height Mode</label>
                    <select
                        id="height-mode-select"
                        value={heightMode}
                        onChange={(e) => setHeightMode(e.target.value)}
                    >
                        <option value="fixed">Fixed</option>
                        <option value="dynamic">Dynamic</option>
                    </select>

                    <button type="submit">Update</button>
                </form>
            </div>
        </div>
    );
}
