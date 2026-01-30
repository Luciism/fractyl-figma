import { TextFragmentSchema } from "../../../shared/schema-types.ts";
import { getNodeId } from "../../ids.ts";
import { rgbToHex } from "../color.ts";
import { svgOpeningTag } from "../svg.ts";
import xmlFormat from "xml-formatter";

const FALLBACKFONTFAMILY = "Inter, Arial, system-ui";

interface TextPositioning {
    masterRelativeX: number;
    masterRelativeY: number;
    anchorX: string;
    anchorY: string;
}

function getTextNodePositionAndAlignment(
    masterNode: SceneNode,
    node: TextNode,
): TextPositioning {
    let anchorX = "start";
    let anchorY = "hanging";

    const box = node.absoluteBoundingBox;
    if (!box) {
        throw new Error(`No bounding box for node: ${node}`);
    }

    let masterRelativeX = box.x - masterNode.x;
    let masterRelativeY = box.y - masterNode.y;

    switch (node.textAlignHorizontal) {
        case "CENTER":
            masterRelativeX += box.width / 2;
            anchorX = "middle";
            break;
        case "RIGHT":
            masterRelativeX += box.width;
            anchorX = "end";
            break;
    }
    switch (node.textAlignVertical) {
        case "CENTER":
            masterRelativeY += box.height / 2;
            anchorY = "middle";
            break;
        case "BOTTOM":
            masterRelativeY += box.height;
            anchorY = "end";
            break;
    }

    return {
        masterRelativeX,
        masterRelativeY,
        anchorX: anchorX,
        anchorY: anchorY,
    };
}

function fillsToSvgColor(fills: readonly Paint[]): string {
    // FIXME: handle layered colors and gradients
    const fill = fills[0];

    if (!fill) {
        return "none";
    }

    if (fill.type === "SOLID") {
        return rgbToHex(
            fill.color.r * 255,
            fill.color.g * 255,
            fill.color.b * 255,
        );
    }

    // TODO: handle gradients
    return "white";
}

export function buildTextSvgElement(
    masterNode: SceneNode,
    textNode: TextNode,
): { svgCode: string; placeholders: string[] } {
    const fontSize = typeof textNode.fontSize != "symbol" ? textNode.fontSize : 24;
    const fontWeight = typeof textNode.fontWeight != "symbol" ? textNode.fontWeight : 400;
    let fill, fontFamily;

    if (typeof textNode.fontName == "symbol") {
        const allFonts = textNode.getRangeAllFontNames(0, 1);
        if (allFonts) {
            fontFamily = `${allFonts[0].family}, ${FALLBACKFONTFAMILY}`
        } else {
            fontFamily = FALLBACKFONTFAMILY;
        }
    } else {
        fontFamily = textNode.fontName.family;
    }

    if (typeof textNode.fills == "symbol") {
        fill = "white";
    } else {
        fill = fillsToSvgColor(textNode.fills);
    }

    const position = getTextNodePositionAndAlignment(masterNode, textNode);
    const nodeId = getNodeId(textNode);

    return {
        svgCode: `
        <text
            fractyl-id="${nodeId}"
            x="${position.masterRelativeX}"
            y="${position.masterRelativeY}"
            text-anchor="${position.anchorX}"
            dominant-baseline="${position.anchorY}"
            font-family="${fontFamily}"
            font-size="${fontSize}"
            font-weight="${fontWeight}"
            fill="${fill}"
        >
            {${nodeId}#text}
        </text>
    `,
        placeholders: [`${nodeId}#text`]
    };
}

export default function exportTextFragments(
    masterNode: SceneNode,
    textNodes: TextNode[],
): { svgCode: string; schema: TextFragmentSchema } {
    const textSvgs: string[] = [];
    let placeholders: string[] = [];

    textNodes.forEach((textNode) => {
        if (!textNode.visible || !textNode.opacity || !textNode.characters) {
            return;
        }

        const svgText = buildTextSvgElement(masterNode, textNode);
        textSvgs.push(svgText.svgCode);
        placeholders = placeholders.concat(svgText.placeholders);
    });

    return {
        svgCode: xmlFormat(
            `
        ${svgOpeningTag(masterNode)}
        ${textSvgs.join("\n")}
        </svg>
    `,
            { lineSeparator: "\n" },
        ),
        schema: {
            src: "text-fragments.svg",
            placeholders,
            position: {
                x: 0,
                y: 0,
            },
        },
    };
}
