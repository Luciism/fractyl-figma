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
    const [colorMode, setColorMode] = useState("fixed");
    const [clipToParent, setClipToParent] = useState(true);
    const [colorMatchShadow, setColorMatchShadow] = useState(false);

    const [feedbackMsg, setFeedbackMsg] = useState({ msg: null, color: "" });

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "selection-changed") {
                const selectedNodes: NodePluginData[] = msg.selectedNodes;
                const selectedShapeNodes = selectedNodes.filter(node => node.tag === "shape");

                if (selectedShapeNodes[0]) {
                    const node = selectedShapeNodes[0];
                    let shouldClipToParent = node.attributes.shouldClipToParent;
                    if (shouldClipToParent == null) {
                        shouldClipToParent = true;
                    }

                    setElementIdInput(node.id || "");
                    setWidthMode(node.attributes.widthMode);
                    setHeightMode(node.attributes.heightMode);
                    setColorMode(node.attributes.colorMode);
                    setColorMatchShadow(node.attributes.shouldColorMatchShadow);
                    setClipToParent(shouldClipToParent);
                }

                return;
            }

            if (msg.type === "feedback-message") {
                setFeedbackMsg(msg.feedback);
            }
        };

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        setFeedbackMsg({msg: null, color: ""});
        parent.postMessage(
            {
                pluginMessage: {
                    type: "update-selection-shape-data",
                    shapeNodeData: {
                        id: elementIdInput,
                        attributes: {
                            widthMode,
                            heightMode,
                            colorMode,
                            shouldClipToParent: clipToParent,
                            shouldColorMatchShadow: colorMatchShadow
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

                    <label htmlFor="color-mode-select">Color Mode</label>
                    <select
                        id="color-mode-select"
                        value={colorMode}
                        onChange={(e) => setColorMode(e.target.value)}
                    >
                        <option value="fixed">Fixed</option>
                        <option value="dynamic">Dynamic</option>
                    </select>

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

                    <div className="checkbox">
                        <input
                            id="clip-to-parent"
                            type="checkbox"
                            checked={clipToParent}
                            onChange={(e) => { setClipToParent(e.target.checked) }}
                        />
                        <label htmlFor="clip-to-parent">Clip To Parent</label>
                    </div>

                    <div className="checkbox">
                        <input
                            id="color-match-shadow"
                            type="checkbox"
                            checked={colorMatchShadow}
                            onChange={(e) => {setColorMatchShadow(e.target.checked)}}
                        />
                        <label htmlFor="color-match-shadow">Color Match Shadow</label>
                    </div>

                    <button type="submit">Update</button>
                    {feedbackMsg.msg && <p className="feedback-msg" style={{ color: feedbackMsg.color }}>{feedbackMsg.msg}</p>}
                </form>
            </div>
        </div>
    );
}
