import { FormEvent, useState, useEffect } from "react";
import { NodePluginData } from "../../shared/types";

export default function ImagesTab({
    setLoading,
}: {
    setLoading: (isLoading: boolean) => void;
}) {
    const [elementIdInput, setElementIdInput] = useState("");

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "selection-changed") {
                const selectedNodes: NodePluginData[] = msg.selectedNodes;
                const selectedTextNodes = selectedNodes.filter(node => node.tag === "image");

                if (selectedTextNodes[0]) {
                    const node = selectedTextNodes[0];
                    setElementIdInput(node.id || "");
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
                    type: "update-selection-image-data",
                    imageNodeData: {
                        id: elementIdInput,
                    },
                },
            },
            "*",
        );
    };

    return (
        <div className="tab">
            <div>
                <h2>Image Properties</h2>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="element-id-input">Element ID</label>
                    <input
                        type="text"
                        placeholder="none"
                        id="element-id-input"
                        value={elementIdInput}
                        onChange={(e) => setElementIdInput(e.target.value)}
                    />
                    <button type="submit">Update</button>
                </form>
            </div>
        </div>
    );
}
