import { rgbaToHex } from "../color";

export function generateFixedShadow(shadows: DropShadowEffect[]) {
    return `
        <filter id="{SHADOW_ID}">
            ${shadows.map(shadow => `<feDropShadow
                dx="${shadow.offset.x}"
                dy="${shadow.offset.y}"
                stdDeviation="${shadow.radius}"
                flood-opacity="${shadow.color.a}"
                flood-color="${rgbaToHex(shadow.color)}"
            />`)}
        </filter>
    `;
}


export function generateColorMatchedShadow(shadow: DropShadowEffect) {
    return `
        <filter id="{SHADOW_ID}">
          <!-- Offset the colored text -->
          <feOffset dx="${shadow.offset.x}" dy="${shadow.offset.y}" in="SourceGraphic" result="offsetColor"/>
          <!-- Blur it -->
          <feGaussianBlur in="offsetColor" stdDeviation="${shadow.radius}" result="blurredColor"/>
          <!-- Darken by 75% (multiply RGB by 0.25) -->
          <feColorMatrix in="blurredColor" result="darkenedShadow"
             type="matrix"
             values="0.25 0    0    0  0
                     0    0.25 0    0  0
                     0    0    0.25 0  0
                     0    0    0    1  0"/>
          <!-- Fade it -->
          <feComponentTransfer in="darkenedShadow" result="fadedShadow">
            <feFuncA type="linear" slope="${shadow.color.a}"/>
          </feComponentTransfer>
          <!-- Put original text on top -->
          <feMerge>
            <feMergeNode in="fadedShadow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
    `;
}
