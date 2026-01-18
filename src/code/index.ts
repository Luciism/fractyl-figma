import exportDynamicFragments from "./export/dynamic.ts";
import exportRasterizedStaticElements from "./export/static.ts";
import { getNodeId, setNodeId } from "./ids.ts";
import getTaggedNodes, { getNodeTag } from "./tagging.ts";

figma.showUI(__html__, { width: 400, height: 500 });

figma.currentPage.selection
figma.on("selectionchange", () => {
    const node = figma.currentPage.selection[0];
    if (!node) {
        return;
    }

    const nodeId = getNodeId(node);
    const nodeTag = getNodeTag(node);

    figma.ui.postMessage({
        type: "selection-changed",
        selectedNodeId: nodeId,
        selectedNodeTag: nodeTag,
    });
});

figma.ui.onmessage = (msg: {
    type: string;
    tag: string;
    restrictTo?: string;
    selectionId?: string;
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

    figma.ui.postMessage({ type: "done" });
};
