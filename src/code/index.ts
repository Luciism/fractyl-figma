import exportDynamicFragments from "./export/dynamic.ts";
import exportRasterizedStaticElements from "./export/static.ts";
import { setNodeId } from "./ids.ts";
import getTaggedNodes, { setNodeTag } from "./tagging.ts";
import "./selection.ts";
import { isShapeNode } from "./nodes.ts";
import { FractylShapeNodeData } from "../shared/types.ts";
import { setShapeHeightMode, setShapeWidthMode } from "./shapes.ts";

figma.showUI(__html__, { width: 400, height: 500 });



figma.ui.onmessage = (msg: {
    type: string;
    tag: string;
    restrictTo?: string;
    selectionId?: string;
    shapeNodeData?: FractylShapeNodeData
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
        figma.currentPage.selection.forEach(node => {
            exportRasterizedStaticElements(node);
        })
    }

    else if (msg.type === "export-dynamic-template") {
        figma.currentPage.selection.forEach(async node => {
            await exportDynamicFragments(node);
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
                }
            })
        }
    }

    figma.ui.postMessage({ type: "done" });
};
