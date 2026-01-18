import { isStyleableNode } from "../nodes.ts";
import getTaggedNodes from "../tagging.ts";


export default async function exportRasterizedStaticElements(node: SceneNode) {
    const clone = node.clone();

    clone.x = 0;
    clone.y = 1000;

    const taggedNodes = getTaggedNodes([clone]);

    taggedNodes.forEach(taggedNode => {
        if (isStyleableNode(taggedNode)) {
            taggedNode.opacity = 0;
        }
    })

    const name = `${node.name}-static`.replace(/\s+/g, "-").toLowerCase();
    const image = await clone.exportAsync({format: "PNG"})
    clone.remove();

    figma.ui.postMessage({
        type: "static-rendered",
        filename: name,
        image
    });
}
