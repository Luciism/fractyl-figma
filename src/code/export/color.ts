import { isParentNode, isStyleableNode } from "../nodes";

export function recursivelyRemoveStaticColors(taggedNodes: SceneNode[], node: SceneNode) {
    if (isParentNode(node)) {
        node.children.forEach((child) =>
            recursivelyRemoveStaticColors(taggedNodes, child),
        );
    }

    if (taggedNodes.indexOf(node) === -1) {
        if (isStyleableNode(node)) {
            node.fills = [];
            node.strokes = [];
            node.effects = [];
        }
    }
}

export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) =>
        Math.max(0, Math.min(255, Math.round(n)))
            .toString(16)
            .padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
