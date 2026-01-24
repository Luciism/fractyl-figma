import { SvgFragmentExport } from "../../../../shared/types";
import { getNodeId } from "../../../ids";
import { getColorMode, getShapeHeightMode, getShapeWidthMode } from "../../../modes";
import { createLinearGradient, createRadialGradient } from "../gradients";

export function rectangleToSVG(node: RectangleNode): SvgFragmentExport {
  const { width, height } = node;
  const widthMode = getShapeWidthMode(node);
  const heightMode = getShapeHeightMode(node);
  const colorMode = getColorMode(node);
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
      const {gradient, placeholders: gradientPlaceholders} = createLinearGradient(fill, gradientId, nodeId, colorMode);
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


  const rectAttrs = [
    `x="0"`,
    `y="0"`,
    `width="${widthAttr}"`,
    `height="${heightAttr}"`,
    rx > 0 ? `rx="${rx}"` : '',
    fillAttr,
    strokeAttr
  ].filter(Boolean).join(' ');

  // Build complete SVG
  const defsSection = defs.length > 0 ? `<defs>${defs.join('')}</defs>` : '';
  
  const svgCode = `<svg width="${widthAttr}" height="${heightAttr}" viewBox="0 0 ${widthAttr} ${heightAttr}" xmlns="http://www.w3.org/2000/svg">
  ${defsSection}
  <rect ${rectAttrs} />
</svg>`;
    
    return {
        svgCode,
        // schema,
        placeholders,
        pluginData: {
            id: nodeId,
            tag: "shape",
            attributes: {
                widthMode,
                heightMode,
                colorMode
            }
        }
    }
}

