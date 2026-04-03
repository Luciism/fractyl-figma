import { setNodeId } from "./ids.ts";
import getTaggedNodes, { setNodeTag } from "./tagging.ts";
import "./selection.ts";
import { isShapeNode, isTextNode } from "./nodes.ts";
import { FractylImageNodeData, FractylShapeNodeData, FractylTextNodeData, isNodeTagType, UpdateGlobalExportSettings } from "../shared/types.ts";
import { setColorMode, setShapeHeightMode, setShapeWidthMode } from "./modes.ts";
import completeExport from "./export/all.ts";
import { setShouldClipToParent } from "./export/dynamic/shapes/clipping.ts";
import { setShouldColorMatchShadow } from "./shadows.ts";
import { getExportSettings, updateExportSettings } from "./exportSettings.ts";
import { getLastActiveTab, setLastActiveTab } from "./lastActiveTab.ts";

figma.showUI(__html__, { width: 420, height: 520 });

export type Handler = (msg: { [key: string]: unknown }) => void;

class MessageHandlers {
    handlers: { msg_type: string, handler: Handler }[]

    constructor() {
        this.handlers = [];
    }

    public addHandler(msg_type: string, handler: Handler): void {
        this.handlers.push({ msg_type, handler });
    }

    public handle(msg: { type: string }) {
        const handlers = this.handlers.filter(handler => handler.msg_type == msg.type);

        handlers.forEach(handler => {
            handler.handler(msg);
        });
    }
}

export const messageHandlers = new MessageHandlers()

messageHandlers.addHandler("tag-selection", ((msg: { type: string, tag: string }) => {
    const items = figma.currentPage.selection;

    items.forEach((item) => {
        if (isNodeTagType(msg.tag)) {
            setNodeTag(item, msg.tag);
        }
    });
}) as Handler)

messageHandlers.addHandler("get-variables", (async (_) => {
    const collections = await figma.variables.getLocalVariableCollectionsAsync()

    const aggregatedCollections = (await Promise.all(collections.map(async collection => {
        return {
            id: collection.id,
            name: collection.name,
            key: collection.key,
            variables:
                (await Promise.all(collection.variableIds.map(async variableId => {
                    const variable = await figma.variables.getVariableByIdAsync(variableId);
                    if (!variable) {
                        return null;
                    }

                    return {
                        id: variable.id,
                        name: variable.name,
                        key: variable.key,
                        description: variable.description,
                        variableCollectionId: variable.variableCollectionId,
                        resolvedType: variable.resolvedType,
                        valuesByMode: variable.valuesByMode
                    };
                }).filter(v => v !== null)))

        }
    })));

    figma.ui.postMessage({
        type: "get-variables",
        collections: aggregatedCollections,
    });
}) as Handler)

messageHandlers.addHandler("get-export-settings", (async (_) => {
    figma.ui.postMessage({
        type: "get-export-settings",
        exportSettings: getExportSettings()
    });
}) as Handler)

messageHandlers.addHandler("update-export-settings", ( (
    msg: { exportSettings: UpdateGlobalExportSettings }
) => {
    updateExportSettings(msg.exportSettings);
}) as Handler)

messageHandlers.addHandler("get-last-active-tab", ((_) => {
    figma.ui.postMessage({
        type: "get-last-active-tab",
        lastActiveTabId: getLastActiveTab()
    });
}) as Handler)

messageHandlers.addHandler("set-last-active-tab", ((msg: {activeTabId: string}) => {
    setLastActiveTab(msg.activeTabId);
}) as Handler)

figma.ui.onmessage = (msg: {
    type: string;
    restrictTo?: string;
    selectionId?: string;
    shapeNodeData?: FractylShapeNodeData,
    textNodeData?: FractylTextNodeData,
    imageNodeData?: FractylImageNodeData
}) => {
    messageHandlers.handle(msg);


    if (msg.type === "select-selected-tagged") {
        figma.currentPage.selection = getTaggedNodes(
            figma.currentPage.selection,
            msg.restrictTo,
        );
    }

    else if (msg.type === "select-all-tagged") {
        figma.currentPage.selection = getTaggedNodes(
            figma.currentPage.children,
            msg.restrictTo,
        );
    }

    else if (msg.type === "detag-selected") {
        getTaggedNodes(figma.currentPage.selection).forEach((node) => {
            node.setSharedPluginData("fractyl", "dynamic", "");
        });
    }

    else if (msg.type === "complete-export") {
        figma.currentPage.selection.forEach(async node => {
            await completeExport(node);
        })
    }

    else if (msg.type === "set-selection-id") {
        const id = msg.selectionId;
        if (id) {
            figma.currentPage.selection.forEach(node => {
                setNodeId(node, id);
            })
        }
    }

    else if (msg.type === "update-selection-shape-data") {
        const shapeNodeData = msg.shapeNodeData;
        if (shapeNodeData !== undefined) {
            figma.currentPage.selection.forEach(node => {
                if (isShapeNode(node)) {
                    setNodeId(node, shapeNodeData.id);
                    setNodeTag(node, "shape");
                    setShapeWidthMode(node, shapeNodeData.attributes.widthMode);
                    setShapeHeightMode(node, shapeNodeData.attributes.heightMode);
                    setColorMode(node, shapeNodeData.attributes.colorMode);
                    setShouldClipToParent(node, shapeNodeData.attributes.shouldClipToParent);
                    setShouldColorMatchShadow(node, shapeNodeData.attributes.shouldColorMatchShadow);
                } else {
                    figma.ui.postMessage({
                        type: "feedback-message",
                        feedback: {
                            msg: "Some selected nodes are not valid shapes.",
                            color: "yellow"
                        },
                    });
                }
            })
        }
    }

    else if (msg.type === "update-selection-text-data") {
        const textNodeData = msg.textNodeData;

        if (textNodeData !== undefined) {
            figma.currentPage.selection.forEach(node => {
                if (isTextNode(node)) {
                    setNodeId(node, textNodeData.id);
                    setNodeTag(node, textNodeData.id ? "text" : null);
                    setColorMode(node, textNodeData.attributes.colorMode);
                    setShouldColorMatchShadow(node, textNodeData.attributes.shouldColorMatchShadow);
                } else {
                    figma.ui.postMessage({
                        type: "feedback-message",
                        feedback: {
                            msg: "Some selected nodes are not valid text nodes.",
                            color: "yellow"
                        },
                    });
                }
            })
        }
    }

    else if (msg.type === "update-selection-image-data") {
        const imageNodeData = msg.imageNodeData;

        if (imageNodeData !== undefined) {
            figma.currentPage.selection.forEach(node => {
                if (isShapeNode(node)) {
                    setNodeId(node, imageNodeData.id);
                    setNodeTag(node, "image");
                } else {
                    figma.ui.postMessage({
                        type: "feedback-message",
                        feedback: {
                            msg: "Some selected nodes are not valid image nodes (must be rectangles).",
                            color: "yellow"
                        },
                    });
                }
            })
        }
    }

    figma.ui.postMessage({ type: "done" });
};
