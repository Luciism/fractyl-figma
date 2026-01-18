import { isParentNode } from "./nodes";

export function setNodeId(node: SceneNode, id: string) {
    // Disallow duplicates
    // if (masterNode !== undefined && getNodeWithId(masterNode, id)) {
    //     return;
    // }

    node.setSharedPluginData("fractyl", "id", id);
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
