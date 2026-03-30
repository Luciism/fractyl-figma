import { ModeAttribute } from "../../../shared/types";

function calculateGradientPositions(transform: Transform, invertX?: boolean, invertY?: boolean): {x1: number, y1: number, x2: number, y2: number} {
    const [[a, b, tx], [c, d, ty]] = transform;

    const det = a * d - b * c;

    const invA =  d / det;
    const invB = -c / det;  // note: -c not -b
    const invE = (b * ty - d * tx) / det;
    const invF = (c * tx - a * ty) / det;

    return {
      x1: invertX ? 1 - invE : invE,
      y1: invertY ? 1 - invF : invF,
      x2: invertX ? 1 - (invA + invE) : invA + invE,
      y2: invertY ? 1 - (invB + invF) : invB + invF,
    };
}

export function createLinearGradient(
    fill: GradientPaint,
    id: string,
    nodeId: string | null,
    colorMode: ModeAttribute,
    invertX?: boolean,
    invertY?: boolean
): {gradient: string, placeholders: string[]} {
    const placeholders: string[] = [];

    const stops = fill.gradientStops.map((stop, i) => {
        if (colorMode == "dynamic") {
            placeholders.push(`${nodeId}#gradientStop.${i}`);
            return `<stop offset="${stop.position}" stop-color="{${nodeId}#gradientStop.${i}}" />`;
        }

        const { r, g, b } = stop.color;
        const a = stop.color.a !== undefined ? stop.color.a : 1;
        return `<stop offset="${stop.position}" stop-color="rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})" stop-opacity="${fill.opacity}" />`;
    }).join('');


    const {x1, y1, x2, y2} = calculateGradientPositions(fill.gradientTransform, invertX, invertY);

    const gradient = `<linearGradient
        id="${id}"
        x1="${x1}"
        y1="${y1}"
        x2="${x2}"
        y2="${y2}"
        gradientUnits="objectBoundingBox"
    >
    ${stops}
  </linearGradient>`;
    return {gradient, placeholders};
}

export function createRadialGradient(fill: GradientPaint, id: string, width: number, height: number): string {
    // TODO: objectBoundingBox && dynamic color
    const stops = fill.gradientStops.map(stop => {
        const { r, g, b } = stop.color;
        const a = stop.color.a !== undefined ? stop.color.a : 1;
        return `<stop offset="${stop.position}" stop-color="rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})" />`;
    }).join('');

    // Figma's radial gradient starts at center (0.5, 0.5) with radius to (1, 0.5)
    const [[a, b, tx], [c, d, ty]] = fill.gradientTransform;

    // Transform center point (0.5, 0.5)
    const cx = (a * 0.5 + b * 0.5 + tx) * width;
    const cy = (c * 0.5 + d * 0.5 + ty) * height;

    // Transform radius endpoint (1, 0.5) and calculate distance from center
    const rx = (a * 1 + b * 0.5 + tx) * width;
    const ry = (c * 1 + d * 0.5 + ty) * height;
    const r = Math.sqrt(Math.pow(rx - cx, 2) + Math.pow(ry - cy, 2));

    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse">
    ${stops}
  </radialGradient>`;
}

