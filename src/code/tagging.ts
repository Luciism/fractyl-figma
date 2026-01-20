import { isNodeTagType, NodeTagType } from "../shared/types";
import { isParentNode } from "./nodes";

export default function getTaggedNodes(
    searchNodes: readonly SceneNode[],
    restrictTo?: string,
): SceneNode[] {
    const taggedNodes: SceneNode[] = [];

    const recursivelyFindNodes = (node: SceneNode) => {
        if (isParentNode(node)) {
            node.children.forEach((child) => recursivelyFindNodes(child));
        }

        const tag = node.getSharedPluginData("fractyl", "dynamic");
        if (tag) {
            if (restrictTo && tag !== restrictTo) {
                return;
            }
            taggedNodes.push(node);
        }
    };

    searchNodes.forEach(recursivelyFindNodes);
    return taggedNodes;
}

export function getNodeTag(node: SceneNode): NodeTagType | null {
    const tag = node.getSharedPluginData("fractyl", "dynamic");
    return isNodeTagType(tag) ? tag : null;
}

export function setNodeTag(node: SceneNode, tag: NodeTagType | null) {
    node.setSharedPluginData("fractyl", "dynamic", tag || "");
}
