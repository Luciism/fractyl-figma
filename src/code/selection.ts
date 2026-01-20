import { FractylShapeNodeData, FractylShapeNodeDataAttributes, NodePluginData } from "../shared/types";
import { getNodeId } from "./ids";
import { getShapeHeightMode, getShapeWidthMode } from "./shapes";
import { getNodeTag } from "./tagging";

function getShapeAttributes(node: SceneNode): FractylShapeNodeDataAttributes {
    return {
        widthMode: getShapeWidthMode(node),
        heightMode: getShapeHeightMode(node)
    }
}

figma.on("selectionchange", () => {
    const nodes = figma.currentPage.selection.map(node => {
        const tag = getNodeTag(node);

        if (tag === "shape") {
            const nodeData: FractylShapeNodeData = {
                id: getNodeId(node),
                tag: tag,
                attributes: getShapeAttributes(node) 
            };
            return nodeData;
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
