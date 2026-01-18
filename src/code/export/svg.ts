export function svgOpeningTag(masterNode: SceneNode) {
    return `<svg
        width="${masterNode.width}"
        height="${masterNode.height}"
        viewBox="0 0 ${masterNode.width} ${masterNode.height}"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
    >`;
}
