export function getMasterRelativePos(masterNode: SceneNode, node: SceneNode) {
    const box = node.absoluteBoundingBox;
    if (!box) {
        throw new Error(`No bounding box for node: ${node}`);
    }

    const masterRelativeX = box.x - masterNode.x;
    const masterRelativeY = box.y - masterNode.y;

    return {masterRelativeX, masterRelativeY};
}
