import { FormEvent, useState, useEffect } from "react";
import { NodePluginData } from "../../shared/types";

export default function TextTab({
    setLoading,
}: {
    setLoading: (isLoading: boolean) => void;
}) {
    const [elementIdInput, setElementIdInput] = useState("");
    const [colorMode, setColorMode] = useState("fixed");

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "selection-changed") {
                const selectedNodes: NodePluginData[] = msg.selectedNodes;
                const selectedTextNodes = selectedNodes.filter(node => node.tag === "text");

                if (selectedTextNodes[0]) {
                    const node = selectedTextNodes[0];
                    setElementIdInput(node.id || "");
                    setColorMode(node.attributes.colorMode);
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
                    type: "update-selection-text-data",
                    textNodeData: {
                        id: elementIdInput,
                        attributes: {
                            colorMode
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
                <h2>Text Properties</h2>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="element-id-input">Element ID</label>
                    <input
                        type="text"
                        placeholder="none"
                        id="element-id-input"
                        value={elementIdInput}
                        onChange={(e) => setElementIdInput(e.target.value)}
                    />

                    <label htmlFor="color-mode-select">Color Mode</label>
                    <select
                        id="color-mode-select"
                        value={colorMode}
                        onChange={(e) => setColorMode(e.target.value)}
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
