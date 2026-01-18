import { isParentNode, isStyleableNode } from "../nodes.ts";
import getTaggedNodes from "../tagging.ts";
import xmlFormat from 'xml-formatter';

const FALLBACKFONTFAMILY = "Inter, Arial, system-ui";

interface TextPositioning {
    masterRelativeX: number;
    masterRelativeY: number;
    anchorX: string;
    anchorY: string;
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) =>
        Math.max(0, Math.min(255, Math.round(n)))
            .toString(16)
            .padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function svgOpeningTag(masterNode: SceneNode) {
    console.log(masterNode.width);
    console.log(masterNode.height);
    return `<svg
        width="${masterNode.width}"
        height="${masterNode.height}"
        viewBox="0 0 ${masterNode.width} ${masterNode.height}"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
    >`;
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

    return `
        <text
            x="${position.masterRelativeX}"
            y="${position.masterRelativeY}"
            text-anchor="${position.anchorX}"
            dominant-baseline="${position.anchorY}"
            fill="white"
            font-size="20"
        >
        ${segments.map((segment) => `
            <tspan
                font-size="${segment.fontSize}"
                fill="${fillsToSvgColor(segment.fills)}"
                font-weight="${segment.fontWeight}"
                font-family="${segment.fontName.family}, ${FALLBACKFONTFAMILY}"
            >
                ${segment.characters}
            </tspan>`)
        .join("\n")}
        </text>
    `;
}

function buildTextSvgElement(masterNode: SceneNode, textNode: TextNode) {
    if (
        typeof textNode.fontSize == "symbol" ||
        typeof textNode.fills == "symbol" ||
        typeof textNode.fontName == "symbol" ||
        typeof textNode.fontWeight == "symbol"
    ) {
        return buildSegmentedTextSvgElement(masterNode, textNode);
    }

    const position = getTextNodePositionAndAlignment(masterNode, textNode);

    return `
        <text
            id="TODO"
            x="${position.masterRelativeX}"
            y="${position.masterRelativeY}"
            text-anchor="${position.anchorX}"
            dominant-baseline="${position.anchorY}"
            font-family="${textNode.fontName.family}, ${FALLBACKFONTFAMILY}"
            font-size="${textNode.fontSize}"
            fill="${fillsToSvgColor(textNode.fills)}"
        >
            ${textNode.characters}
        </text>
    `;
}

function recursivelyRemoveStaticColors(taggedNodes: SceneNode[], node: SceneNode) {
    if (isParentNode(node)) {
        node.children.forEach((child) =>
            recursivelyRemoveStaticColors(taggedNodes, child),
        );
    }

    if (taggedNodes.indexOf(node) === -1) {
        if (isStyleableNode(node)) {
            node.fills = [];
            node.strokes = [];
            node.effects = [];
        }
    }
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

export default async function exportDynamicFragments(
    node: SceneNode,
): Promise<void> {
    const clone = node.clone();

    // clone.x = 0;
    // clone.y = 1000;

    const taggedNodes = getTaggedNodes([clone]);
    recursivelyRemoveStaticColors(taggedNodes, clone);

    const textSvgs: string[] = [];

    taggedNodes.forEach((taggedNode) => {
        if (taggedNode.type === "TEXT") {
            if (!taggedNode.characters) {
                return;
            }

            const svgText = buildTextSvgElement(clone, taggedNode);
            textSvgs.push(svgText);
        }
    });

    const textFragmentsSvg = xmlFormat(`
        ${svgOpeningTag(clone)}
        ${textSvgs.join("\n")}
        </svg>
    `, {lineSeparator: "\n"});
    // console.log(textFragmentsSvg);

    // const name = `${node.name}-template.svg`.replace(/\s+/g, "-").toLowerCase();
    // const image = await clone.exportAsync({ format: "SVG" })
    clone.remove();

    figma.ui.postMessage({
        type: "dynamic-export",
        files: [
            {
                filename: "text-fragments.svg",
                type: "image/svg",
                file: textFragmentsSvg,
            },
            // {
            //     filename: name,
            //     image
            // }
        ],
        // filename,
        // image: textFragmentsSvgFile
    });
}
