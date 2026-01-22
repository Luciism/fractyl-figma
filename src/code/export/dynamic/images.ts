import { getNodeId } from "../../ids";
import { getMasterRelativePos } from "../position";
import xmlFormat from "xml-formatter";
import { svgOpeningTag } from "../svg";
import { ImageFragmentSchema } from "../../../shared/schema-types";

export default function exportImageFragments(
  masterNode: SceneNode,
  rectNodes: RectangleNode[],
): { svgCode: string; schema: ImageFragmentSchema } {
  const imageSvgTags: string[] = [];
  const placeholders: string[] = [];

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

          placeholders.push(`${nodeId}#href`);
          imageSvgTags.push(
            `<image
                fractyl-id="${nodeId}"
                x="${masterRelativeX}"
                y="${masterRelativeY}"
                width="${node.width}"
                height="${node.height}"
                xlink:href="{${nodeId}#href}"
            />`,
          );
        }
      }
    }
  });

  return {
    svgCode: xmlFormat(
      `
        ${svgOpeningTag(masterNode)}
        ${imageSvgTags.join("\n")}
        </svg>
    `,
      { lineSeparator: "\n" },
    ),
    schema: {
      src: `image-fragments.svg`,
      placeholders,
      position: {
        x: 0,
        y: 0,
      },
    },
  };
}
