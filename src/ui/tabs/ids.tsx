import { useEffect, useState } from "react";

export default function IdManagementTab({
    setLoading,
}: {
    setLoading: (isLoading: boolean) => void;
}) {
    const [elementIdInput, setElementIdInput] = useState("");

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "selection-changed") {
                const selectionId: string = msg.selectedNodeId;
                setElementIdInput(selectionId || "");
                return;
            }
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    const executeSetSelectionId = () => {
        const selectionId = elementIdInput;

        setLoading(true);
        parent.postMessage(
            {
                pluginMessage: {
                    type: "set-selection-id",
                    selectionId,
                },
            },
            "*",
        );
    };

    return (
        <div className="tab">
            <div>
                <p style={{color: "yellow"}}>Advanced tab: debugging purposes only</p>
                <h2>Element IDs</h2>

                <form onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="set-selection-id-input">Set Selection ID</label>
                    <input
                        id="set-selection-id-input"
                        type="text"
                        placeholder="some_value"
                        value={elementIdInput}
                        onInput={(e) => setElementIdInput(e.currentTarget.value)}
                    />
                    <button onClick={executeSetSelectionId}>Set ID</button>
                </form>
            </div>
        </div>
    );
}
