import { isStyleableNode } from "../nodes.ts";
import getTaggedNodes from "../tagging.ts";
import { changeNodeFillOpacity } from "./color.ts";


export default async function exportRasterizedStaticElements(node: SceneNode) {
    const clone = node.clone();

    if (clone.type != "FRAME") {
        return;  // TODO: show error
    }

    clone.x = 0;
    clone.y = 10000;

    const taggedNodes = getTaggedNodes([clone]);

    taggedNodes.forEach(taggedNode => {
        if (isStyleableNode(taggedNode)) {
            taggedNode.opacity = 0;
        }
    });

    const opaqueName = `${node.name}-static`.replace(/\s+/g, "-").toLowerCase();
    const opaqueImage = await clone.exportAsync({format: "PNG"})

    // Recursively traverses frames to find the first one with a fill.
    // This sets the opacity of each tile
    const recursivelyUnfillBaseFrame = (node: FrameNode) => {
        node.children.forEach(child => {
            if (child.type == "INSTANCE") {
                child = child.detachInstance();
            }

            if (child.type == "FRAME" ) {
                // Ensure it isn't a layout frame
                if (typeof child.fills != "symbol" && child.fills.length) {
                    changeNodeFillOpacity(child, 0.5);
                    return;
                }

                recursivelyUnfillBaseFrame(child);
            }
        })

    }
    recursivelyUnfillBaseFrame(clone);

    const translucentName = `${node.name}-static-translucent`.replace(/\s+/g, "-").toLowerCase();
    const translucentImage = await clone.exportAsync({format: "PNG"})

    clone.remove();

    figma.ui.postMessage({
        type: "static-rendered",
        files: [
            {
                filename: opaqueName,
                file: opaqueImage 
            },
            {
                filename: translucentName,
                file: translucentImage
            }
        ]
    });
}
