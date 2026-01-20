import { ShapeDimensionMode, isShapeDimensionMode } from "../shared/types";

export function setShapeWidthMode(node: SceneNode, mode: ShapeDimensionMode) {
    node.setSharedPluginData("fractyl", "widthMode", mode);
}

export function getShapeWidthMode(node: SceneNode): ShapeDimensionMode {
    const widthMode = node.getSharedPluginData("fractyl", "widthMode");
    return isShapeDimensionMode(widthMode) ? widthMode : "fixed";
}

export function setShapeHeightMode(node: SceneNode, mode: ShapeDimensionMode) {
    node.setSharedPluginData("fractyl", "heightMode", mode);
}

export function getShapeHeightMode(node: SceneNode): ShapeDimensionMode {
    const heightMode = node.getSharedPluginData("fractyl", "heightMode");
    return isShapeDimensionMode(heightMode) ? heightMode : "fixed";
}

