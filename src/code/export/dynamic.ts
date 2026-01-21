import { NodePluginData } from "../../shared/types.ts";
import getTaggedNodes from "../tagging.ts";
import { recursivelyRemoveStaticColors } from "./color.ts";
import exportImageFragments from "./dynamic/images.ts";
import { rectangleToSVG } from "./dynamic/shapes/rect.ts";
import exportTextFragments from "./dynamic/text.ts";


export default async function exportDynamicFragments(
    node: SceneNode,
): Promise<void> {
    const clone = node.clone();

    const taggedNodes = getTaggedNodes([clone]);
    recursivelyRemoveStaticColors(taggedNodes, clone);

    const textFragmentsSvg = exportTextFragments(clone, taggedNodes.filter(node => node.type == "TEXT"));
    const imageFragmentsSvg = exportImageFragments(clone, taggedNodes.filter(node => node.type == "RECTANGLE"));

    const shapeFragmentSvgs: {svgCode: string, pluginData: NodePluginData}[] = [];
    taggedNodes.filter(node => node.type == "RECTANGLE").forEach(node => {
        if (typeof node.fills != "symbol" && node.fills[0] && node.fills[0].type != "IMAGE") {
            shapeFragmentSvgs.push(rectangleToSVG(node));
        }
    })

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
        ].concat(
            shapeFragmentSvgs.map(fragment => {
                const id = fragment.pluginData.id || Math.round(Math.random() * 10000);

                return {
                    filename: `shape--rect-${id}.svg`,
                    type: "image/svg",
                    file: fragment.svgCode,
                }
            })
        )
    });
}
