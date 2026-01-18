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

function fillsToSvgColor(fills: readonly Paint[]) {
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


function buildSegmentedTextSvgElement(masterNode: SceneNode, textNode: TextNode) {
    const position = getTextNodePositionAndAlignment(masterNode, textNode);

    const segments = textNode.getStyledTextSegments(
        ["fontSize", "fills", "fontWeight", "fontName"],
        0,
        textNode.characters.length,
    );

    const nodeId = getNodeId(textNode);

    return `
        <text
            x="${position.masterRelativeX}"
            y="${position.masterRelativeY}"
            text-anchor="${position.anchorX}"
            dominant-baseline="${position.anchorY}"
            fill="white"
            font-size="20"
        >
        ${segments.map((segment, i) => `
            <tspan
                fractyl-id=${nodeId}
                font-size="${segment.fontSize}"
                fill="${fillsToSvgColor(segment.fills)}"
                font-weight="${segment.fontWeight}"
                font-family="${segment.fontName.family}, ${FALLBACKFONTFAMILY}"
            >
                {${nodeId || segment.characters}#${i}}
            </tspan>`)
        .join("\n")}
        </text>
    `;
}

export function buildTextSvgElement(masterNode: SceneNode, textNode: TextNode) {
    if (
        typeof textNode.fontSize == "symbol" ||
        typeof textNode.fills == "symbol" ||
        typeof textNode.fontName == "symbol" ||
        typeof textNode.fontWeight == "symbol"
    ) {
        return buildSegmentedTextSvgElement(masterNode, textNode);
    }

    const position = getTextNodePositionAndAlignment(masterNode, textNode);
    const nodeId = getNodeId(textNode);

    return `
        <text
            fractyl-id="${nodeId}"
            x="${position.masterRelativeX}"
            y="${position.masterRelativeY}"
            text-anchor="${position.anchorX}"
            dominant-baseline="${position.anchorY}"
            font-family="${textNode.fontName.family}, ${FALLBACKFONTFAMILY}"
            font-size="${textNode.fontSize}"
            fill="${fillsToSvgColor(textNode.fills)}"
        >
            {${nodeId || textNode.characters}}
        </text>
    `;
}

export default function exportTextFragments(masterNode: SceneNode, textNodes: TextNode[]) {
    const textSvgs: string[] = [];

    textNodes.forEach((textNode) => {
        if (!textNode.visible || !textNode.opacity || !textNode.characters) {
            return;
        }

        const svgText = buildTextSvgElement(masterNode, textNode);
        textSvgs.push(svgText);
    });

    return xmlFormat(`
        ${svgOpeningTag(masterNode)}
        ${textSvgs.join("\n")}
        </svg>
    `, {lineSeparator: "\n"});
}



