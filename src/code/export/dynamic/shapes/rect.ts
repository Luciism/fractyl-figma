import { SvgFragmentExport } from "../../../../shared/types";
import { getNodeId } from "../../../ids";
import { getColorMode, getShapeHeightMode, getShapeWidthMode } from "../../../modes";
import { getShouldColorMatchShadow } from "../../../shadows";
import { createLinearGradient, createRadialGradient } from "../gradients";
import { generateColorMatchedShadow, generateFixedShadow } from "../shadow";
import { getShouldClipToParent } from "./clipping";

export function rectangleToSVG(node: RectangleNode): SvgFragmentExport {
    const { width, height } = node;
    const widthMode = getShapeWidthMode(node);
    const heightMode = getShapeHeightMode(node);
    const colorMode = getColorMode(node);

    const shouldColorMatchShadow = getShouldColorMatchShadow(node);
    const shadows = node.effects.filter((effect) => effect.type === "DROP_SHADOW");

    let shouldClipToParent = getShouldClipToParent(node);
    if (shouldClipToParent == null) {
        shouldClipToParent = true;
    }
    const nodeId = getNodeId(node);

    // Build SVG parts
    const defs: string[] = [];
    let fillAttr = '';
    let strokeAttr = '';
    let strokeWidth = 0;
    let placeholders: string[] = [];

    // Handle fills
    if (node.fills && typeof node.fills !== "symbol" && node.fills.length > 0) {
        const fill = node.fills[0];

        if (fill.type === 'SOLID' && fill.visible !== false) {
            if (colorMode == "dynamic") {
                fillAttr = `fill="{${nodeId}#fill}"`;
                placeholders.push(`${nodeId}#fill`);
            } else {
                const { r, g, b } = fill.color;
                const a = fill.opacity !== undefined ? fill.opacity : 1;
                fillAttr = `fill="rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})"`;
            }
        }
        else if (fill.type === 'GRADIENT_LINEAR' && fill.visible !== false) {
            const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
            const { gradient, placeholders: gradientPlaceholders } = createLinearGradient(fill, gradientId, nodeId, colorMode);
            placeholders = placeholders.concat(gradientPlaceholders);
            defs.push(gradient);
            fillAttr = `fill="url(#${gradientId})"`;
        }
        else if (fill.type === 'GRADIENT_RADIAL' && fill.visible !== false) {
            const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
            const gradient = createRadialGradient(fill, gradientId, width, height);
            defs.push(gradient);
            fillAttr = `fill="url(#${gradientId})"`;
        }
    }

    // Handle strokes
    if (node.strokes && typeof node.strokes !== "symbol" && node.strokes.length > 0) {
        const stroke = node.strokes[0];

        if (stroke.visible !== false && typeof stroke !== "symbol") {
            strokeWidth = typeof node.strokeWeight !== "symbol" ? node.strokeWeight || 1 : 1;

            if (stroke.type === 'SOLID') {
                const { r, g, b } = stroke.color;
                const a = stroke.opacity !== undefined ? stroke.opacity : 1;
                strokeAttr = `stroke="rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})" stroke-width="${strokeWidth}"`;
            }
        }
    }

    // Build rect element with clamped corner radius
    let rx = typeof node.cornerRadius === 'number'
        ? node.cornerRadius
        : Math.min(
            (node.topLeftRadius || 0),
            (node.topRightRadius || 0),
            (node.bottomLeftRadius || 0),
            (node.bottomRightRadius || 0)
        );

    // SVG automatically clamps rx to half the smallest dimension for pill shapes
    rx = Math.min(rx, width / 2, height / 2);

    let widthAttr: string;
    if (widthMode == "dynamic" && nodeId) {
        widthAttr = `{${nodeId}#width}`;
        placeholders.push(`${nodeId}#width`);
    } else {
        widthAttr = width.toString();
    }

    let heightAttr: string;
    if (heightMode == "dynamic" && nodeId) {
        heightAttr = `{${nodeId}#height}`;
        placeholders.push(`${nodeId}#height`);
    } else {
        heightAttr = height.toString();
    }

    let parent = node.parent;
    if (parent && parent.type != "FRAME" && parent.type != "INSTANCE") {
        parent = null;
    }

    const rectAttrs = [
        `x="${parent && shouldClipToParent ? node.x : 0}"`,
        `y="${parent && shouldClipToParent ? node.y : 0}"`,
        `width="${widthAttr}"`,
        `height="${heightAttr}"`,
        rx > 0 ? `rx="${rx}"` : '',
        fillAttr,
        strokeAttr
    ];

    if (shouldColorMatchShadow && shadows.length) {
        const shadowDef = generateColorMatchedShadow(shadows[0]);
        defs.push(shadowDef.replace("{SHADOW_ID}", `shadow-${nodeId}`));
        rectAttrs.push(`filter="url(#shadow-${nodeId})"`);
    } else if (shadows.length) {
        const shadowDef = generateFixedShadow(shadows);
        defs.push(shadowDef.replace("{SHADOW_ID}", `shadow-${nodeId}`));
        rectAttrs.push(`filter="url(#shadow-${nodeId})"`);
    }

    // Build complete SVG
    const defsSection = defs.length > 0 ? `<defs>${defs.join('')}</defs>` : '';

    const svgWidth = parent && shouldClipToParent ? parent.width : widthAttr;
    const svgHeight = parent && shouldClipToParent ? parent.height : heightAttr;

    const svgCode = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        ${defsSection}
        <rect ${rectAttrs.filter(Boolean).join(' ')} />
    </svg>`;

    return {
        svgCode,
        placeholders,
        pluginData: {
            id: nodeId,
            tag: "shape",
            attributes: {
                widthMode,
                heightMode,
                colorMode,
                shouldClipToParent,
                shouldColorMatchShadow
            }
        }
    }
}

