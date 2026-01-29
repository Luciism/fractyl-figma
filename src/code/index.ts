import exportDynamicFragments from "./export/dynamic.ts";
import exportRasterizedStaticElements from "./export/static.ts";
import { setNodeId } from "./ids.ts";
import getTaggedNodes, { setNodeTag } from "./tagging.ts";
import "./selection.ts";
import { isShapeNode, isTextNode } from "./nodes.ts";
import { FractylImageNodeData, FractylShapeNodeData, FractylTextNodeData, isNodeTagType } from "../shared/types.ts";
import { setColorMode, setShapeHeightMode, setShapeWidthMode } from "./modes.ts";
import completeExport from "./export/all.ts";

figma.showUI(__html__, { width: 420, height: 520 });

type Handler = (msg: { [key: string]: unknown }) => void;

class MessageHandlers{
    handlers: {msg_type: string, handler: Handler}[]

    constructor() {
        this.handlers = [];
    }

    public addHandler(msg_type: string, handler: Handler): void {
        this.handlers.push({msg_type, handler});
    }

    public handle(msg: {type: string}) {
        const handlers = this.handlers.filter(handler => handler.msg_type == msg.type);

        handlers.forEach(handler => {
            handler.handler(msg);
        });
    }
}

export const messageHandlers = new MessageHandlers()

messageHandlers.addHandler("tag-selection", ((msg: {type: string, tag: string}) => {
    const items = figma.currentPage.selection;

    items.forEach((item) => {
        if (isNodeTagType(msg.tag)) {
            setNodeTag(item, msg.tag);
        }
    });
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

    else if (msg.type === "rasterize-static") {
        figma.currentPage.selection.forEach(async node => {
            const statics = await exportRasterizedStaticElements(node);
            figma.ui.postMessage({type: "static-rendered", files: statics.files});
        })
    }

    else if (msg.type === "export-dynamic-template") {
        figma.currentPage.selection.forEach(async node => {
            const fragments = await exportDynamicFragments(node);
            figma.ui.postMessage({type: "dynamic-export", files: fragments.files});
        })
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
                    setNodeTag(node, "text");
                    setColorMode(node, textNodeData.attributes.colorMode);
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
                }
            })
        }
    }

    figma.ui.postMessage({ type: "done" });
};
