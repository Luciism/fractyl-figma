import { isParentNode } from "./nodes";

export function setNodeId(node: SceneNode, id: string | null) {
    node.setSharedPluginData("fractyl", "id", id || "");
}

export function getNodeWithId(parentNode: SceneNode, id: string): SceneNode | null {
    const nodeId = parentNode.getSharedPluginData("fractyl", "id");

    if (nodeId === id) {
        return parentNode;
    }

    if (isParentNode(parentNode)) {
        parentNode.children.forEach(childNode => {
            getNodeWithId(childNode, id);
        });
    }
    
    return null;
}

export function getNodeId(node: SceneNode): string | null {
    const nodeId = node.getSharedPluginData("fractyl", "id");
    return nodeId || null;
}
