import { getNodeId } from "../../ids";
import { getMasterRelativePos } from "../position";
import xmlFormat from "xml-formatter";
import { svgOpeningTag } from "../svg";

export default function exportImageFragments(masterNode: SceneNode, rectNodes: RectangleNode[]) {
    const imageSvgTags: string[] = [];

    rectNodes.forEach(async node => {
        if (typeof node.fills !== 'symbol' && node.visible && node.opacity) {
            const fill = node.fills[0];

            if (fill && fill.type == "IMAGE" && fill.imageHash) {
                const image = figma.getImageByHash(fill.imageHash);
                
                if (image) {
                    const {masterRelativeX, masterRelativeY} = getMasterRelativePos(masterNode, node);
                    const nodeId = getNodeId(node);

                    imageSvgTags.push(
                        `<image
                            fractyl-id="${nodeId}"
                            x="${masterRelativeX}"
                            y="${masterRelativeY}"
                            width="${node.width}"
                            height="${node.height}"
                            xlink:href="{${nodeId}}"
                        />`
                    )
                }

                // node.fills = [{type: "SOLID", color: {r: 0, g: 0, b: 0}}];
                // console.log(await node.exportAsync({format: "SVG"}));
            }
        }
    })
    return xmlFormat(`
        ${svgOpeningTag(masterNode)}
        ${imageSvgTags.join("\n")}
        </svg>
    `, {lineSeparator: "\n"});
}
