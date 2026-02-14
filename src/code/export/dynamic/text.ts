import { TextFragmentSchema } from "../../../shared/schema-types.ts";
import { getNodeId } from "../../ids.ts";
import { getColorMode } from "../../modes.ts";
import { getShouldColorMatchShadow } from "../../shadows.ts";
import { rgbToHex } from "../color.ts";
import { svgOpeningTag } from "../svg.ts";
import xmlFormat from "xml-formatter";
import { generateColorMatchedShadow, generateFixedShadow } from "./shadow.ts";

const FALLBACKFONTFAMILY = "Inter, Arial, system-ui";

function hashString(str: string) {
    let hash = 0,
        i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}


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
): { svgCode: string; placeholders: string[], defs: string | null } {
    const fontSize = typeof textNode.fontSize != "symbol" ? textNode.fontSize : 24;
    const fontWeight = typeof textNode.fontWeight != "symbol" ? textNode.fontWeight : 400;
    const shadows = textNode.effects.filter(effect => effect.type == "DROP_SHADOW");
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

    const nodeId = getNodeId(textNode);
    const placeholders: string[] = [`${nodeId}#text`];

    if (getColorMode(textNode) == "dynamic") {
        fill = `{${nodeId}#fill}`;
        placeholders.push(`${nodeId}#fill`);
    } else if (typeof textNode.fills == "symbol") {
        fill = "white";
    } else {
        fill = fillsToSvgColor(textNode.fills);
    }

    const colorMatchShadow = getShouldColorMatchShadow(textNode);

    let defs = shadows.length ? (
        colorMatchShadow 
            ? generateColorMatchedShadow(shadows[0])
            : generateFixedShadow(shadows)
    ) : null;

    // Allows for the removal of duplicate shadows later on
    let shadow_id: string | null;
    if (defs) {
        shadow_id = `shadow-${hashString(defs)}`;
        defs = defs.replace("{SHADOW_ID}", shadow_id);
    } else {
        shadow_id = null;
    }

    const position = getTextNodePositionAndAlignment(masterNode, textNode);

    return {
        svgCode: `
        <text
            ${shadow_id ? `filter="url(#${shadow_id})"` : ""}
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
        placeholders,
        defs
    };
}

export default function exportTextFragments(
    masterNode: SceneNode,
    textNodes: TextNode[],
): { svgCode: string; schema: TextFragmentSchema } {
    const textSvgs: string[] = [];
    const defs: string[] = [];
    let placeholders: string[] = [];

    textNodes.forEach((textNode) => {
        if (!textNode.visible || !textNode.opacity || !textNode.characters) {
            return;
        }

        const svgText = buildTextSvgElement(masterNode, textNode);
        textSvgs.push(svgText.svgCode);
        placeholders = placeholders.concat(svgText.placeholders);

        if (svgText.defs) {
            defs.push(svgText.defs);
        }
    });

    const deDupedDefs = [...new Set(defs)];

    return {
        svgCode: xmlFormat( `
        ${svgOpeningTag(masterNode)}
        <defs>
            ${deDupedDefs.join("\n")}
        </defs>
        ${textSvgs.join("\n")}
        </svg>
    `,
            { lineSeparator: "\n" },
        ),
        schema: {
            src: "text/text-fragments.svg",
            placeholders,
            position: {
                x: 0,
                y: 0,
            },
        },
    };
}
