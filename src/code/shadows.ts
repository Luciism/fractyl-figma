export function getShouldColorMatchShadow(node: SceneNode) {
    const value = node.getSharedPluginData("fractyl", "colorMatchShadow");
    return value == "1"
}

export function setShouldColorMatchShadow(node: SceneNode, shouldColorMatch: boolean) {
    node.setSharedPluginData("fractyl", "colorMatchShadow", shouldColorMatch ? "1" : "0");
}

