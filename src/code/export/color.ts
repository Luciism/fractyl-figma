import { isParentNode, isStyleableNode } from "../nodes";

export function recursivelyRemoveStaticColors(taggedNodes: SceneNode[], node: SceneNode) {
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

export function rgbToHex(r: number, g: number, b: number, a?: number): string {
    const toHex = (n: number) =>
        Math.max(0, Math.min(255, Math.round(n)))
            .toString(16)
            .padStart(2, "0");

    const hexString = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    if (a == undefined) {
        return hexString;
    }

    return `${hexString}${toHex(a)}`;
}

export function rgbaToHex(rgba: RGBA, include_alpha: boolean = false): string {
    console.log("CONVERTING COLOR:", rgba);
    return rgbToHex(rgba.r * 255, rgba.g * 255, rgba.b * 255, include_alpha ? rgba.a * 255 : undefined);
}



export function rgbToRgba(rgb: RGB, a: number): RGBA {
    return { r: rgb.r, g: rgb.g, b: rgb.b, a: a }
}

function changeGradientOpacity(paint: GradientPaint, alpha: number): GradientPaint {
    return {
        opacity: alpha,
        gradientStops: paint.gradientStops,
        blendMode: paint.blendMode,
        gradientTransform: paint.gradientTransform,
        visible: paint.visible,
        type: paint.type,
    }
}

export function changeNodeFillOpacity(node: FrameNode, alpha: number) {
    if (typeof node.fills != "symbol") {
        node.fills = node.fills.map(fill => {
            switch (fill.type) {
                case "SOLID":
                    return figma.util.solidPaint(rgbToRgba(fill.color, alpha), { blendMode: fill.blendMode, boundVariables: fill.boundVariables, opacity: alpha });
                case "GRADIENT_LINEAR":
                case "GRADIENT_RADIAL":
                case "GRADIENT_ANGULAR":
                case "GRADIENT_DIAMOND":
                    return changeGradientOpacity(fill, alpha);
            }

            return fill;
        })
    }
}
