import getTaggedNodes from "../tagging.ts";
import { recursivelyRemoveStaticColors } from "./color.ts";
import exportImageFragments from "./dynamic/images.ts";
import exportTextFragments from "./dynamic/text.ts";


export default async function exportDynamicFragments(
    node: SceneNode,
): Promise<void> {
    const clone = node.clone();

    const taggedNodes = getTaggedNodes([clone]);
    recursivelyRemoveStaticColors(taggedNodes, clone);

    const textFragmentsSvg = exportTextFragments(clone, taggedNodes.filter(node => node.type == "TEXT"));
    const imageFragmentsSvg = exportImageFragments(clone, taggedNodes.filter(node => node.type == "RECTANGLE"));

    clone.remove();

    figma.ui.postMessage({
        type: "dynamic-export",
        files: [
            {
                filename: "text-fragments.svg",
                type: "image/svg",
                file: textFragmentsSvg,
            },
            {
                filename: "image-fragments.svg",
                type: "image/svg",
                file: imageFragmentsSvg,
            }
        ]
    });
}
