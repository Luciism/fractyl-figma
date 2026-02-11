import { NodePluginData } from "../shared/types";
import { getShouldClipToParent } from "./export/dynamic/shapes/clipping";
import { getNodeId } from "./ids";
import { getColorMode, getShapeHeightMode, getShapeWidthMode } from "./modes";
import { getNodeTag } from "./tagging";



figma.on("selectionchange", () => {
    const nodes = figma.currentPage.selection.map(node => {
        const tag = getNodeTag(node);

        if (tag === "shape") {
            return {
                id: getNodeId(node),
                tag: tag,
                attributes: {
                    widthMode: getShapeWidthMode(node),
                    heightMode: getShapeHeightMode(node),
                    colorMode: getColorMode(node),
                    shouldClipToParent: getShouldClipToParent(node)
                }
            };
        }

        if (tag === "text") {
            return {
                id: getNodeId(node),
                tag,
                attributes: {
                    colorMode: getColorMode(node)
                } 
            };
        }

        const nodeData: NodePluginData = {
            id: getNodeId(node),
            tag: tag,
            attributes: null 
        };

        return nodeData;
    })

    figma.ui.postMessage({
        type: "selection-changed",
        selectedNodes: nodes,
    });
});
