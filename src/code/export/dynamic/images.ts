import { getNodeId } from "../../ids";
import { getMasterRelativePos } from "../position";
import { svgOpeningTag } from "../svg";
import { ImageFragmentSchema } from "../../../shared/schema-types";

export default function exportImageFragments(
    masterNode: SceneNode,
    rectNodes: RectangleNode[],
): { svgCode: string; schema: ImageFragmentSchema }[] {
    const imageSvgFragments: { svgCode: string, schema: ImageFragmentSchema }[] = [];

    rectNodes.forEach(async (node) => {
        if (typeof node.fills !== "symbol" && node.visible && node.opacity) {
            const fill = node.fills[0];

            if (fill && fill.type == "IMAGE" && fill.imageHash) {
                const image = figma.getImageByHash(fill.imageHash);

                if (image) {
                    const { masterRelativeX, masterRelativeY } = getMasterRelativePos(
                        masterNode,
                        node,
                    );
                    const nodeId = getNodeId(node);

                    imageSvgFragments.push({
                        svgCode: `
                        ${svgOpeningTag(node)}
                            <image
                                fractyl-id="${nodeId}"
                                x="0"
                                y="0"
                                width="${node.width}"
                                height="${node.height}"
                                xlink:href="{${nodeId}#href}"
                            />
                        </svg> `,
                        schema: {
                            placeholders: [`${nodeId}#href`],
                            src: `images/${nodeId}-${Math.floor(Math.random() * 10000)}.svg`,
                            position: {
                                x: Math.round(masterRelativeX),
                                y: Math.round(masterRelativeY)
                            }
                        }
                    })
                }
            }
        }
    });

    return imageSvgFragments;
}
