import exportDynamicFragments from "./export/dynamic.ts";
import exportRasterizedStaticElements from "./export/static.ts";
import { setNodeId } from "./ids.ts";
import getTaggedNodes, { setNodeTag } from "./tagging.ts";
import "./selection.ts";
import { isShapeNode, isTextNode } from "./nodes.ts";
import { FractylShapeNodeData, FractylTextNodeData } from "../shared/types.ts";
import { setColorMode, setShapeHeightMode, setShapeWidthMode } from "./modes.ts";
import completeExport from "./export/all.ts";

figma.showUI(__html__, { width: 400, height: 500 });



figma.ui.onmessage = (msg: {
    type: string;
    tag: string;
    restrictTo?: string;
    selectionId?: string;
    shapeNodeData?: FractylShapeNodeData,
    textNodeData?: FractylTextNodeData
}) => {
    if (msg.type === "tag-selection") {
        const items = figma.currentPage.selection;

        items.forEach((item) => {
            item.setSharedPluginData("fractyl", "dynamic", msg.tag);
        });
    }

    else if (msg.type === "select-selected-tagged") {
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

    figma.ui.postMessage({ type: "done" });
};
