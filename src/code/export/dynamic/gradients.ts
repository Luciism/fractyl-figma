export function createLinearGradient(fill: GradientPaint, id: string): string {
  const stops = fill.gradientStops.map(stop => {
    const { r, g, b } = stop.color;
    const a = stop.color.a !== undefined ? stop.color.a : 1;
    return `<stop offset="${stop.position}" stop-color="rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})" />`;
  }).join('');

  // Figma's gradientTransform is a 3x2 affine matrix: [[a, b, tx], [c, d, ty]]
  // It transforms normalized coordinates (0-1) to shape coordinates
  // The gradient starts at (0, 0.5) and ends at (1, 0.5) in normalized space
  const [[a, b, tx], [c, d, ty]] = fill.gradientTransform;
  
  // Apply transform to start point (0, 0.5) in normalized space
  const x1 = a * 0 + b * 0.5 + tx;
  const y1 = c * 0 + d * 0.5 + ty;
  
  // Apply transform to end point (1, 0.5) in normalized space
  const x2 = a * 1 + b * 0.5 + tx;
  const y2 = c * 1 + d * 0.5 + ty;

  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" gradientUnits="objectBoundingBox">
    ${stops}
  </linearGradient>`;
}

export function createRadialGradient(fill: GradientPaint, id: string, width: number, height: number): string {
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

