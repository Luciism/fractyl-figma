export function setShouldClipToParent(node: SceneNode, shouldClip: boolean) {
    node.setSharedPluginData("fractyl", "shouldClipToParent", shouldClip ? "1" : "0");
}


export function getShouldClipToParent(node: SceneNode): boolean | null{
    const shouldClip = node.getSharedPluginData("fractyl", "shouldClipToParent");

    if (shouldClip == "0") {
        return false;
    }

    if (shouldClip == "1") {
        return true;
    }

   return null; 
}
