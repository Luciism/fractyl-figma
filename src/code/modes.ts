import { ModeAttribute, isModeAttribute } from "../shared/types";

export function setShapeWidthMode(node: SceneNode, mode: ModeAttribute) {
    node.setSharedPluginData("fractyl", "widthMode", mode);
}

export function getShapeWidthMode(node: SceneNode): ModeAttribute {
    const widthMode = node.getSharedPluginData("fractyl", "widthMode");
    return isModeAttribute(widthMode) ? widthMode : "fixed";
}

export function setShapeHeightMode(node: SceneNode, mode: ModeAttribute) {
    node.setSharedPluginData("fractyl", "heightMode", mode);
}

export function getShapeHeightMode(node: SceneNode): ModeAttribute {
    const heightMode = node.getSharedPluginData("fractyl", "heightMode");
    return isModeAttribute(heightMode) ? heightMode : "fixed";
}

export function setColorMode(node: SceneNode, mode: ModeAttribute) {
    node.setSharedPluginData("fractyl", "colorMode", mode);
}

export function getColorMode(node: SceneNode): ModeAttribute {
    const colorMode = node.getSharedPluginData("fractyl", "colorMode");
    return isModeAttribute(colorMode) ? colorMode : "fixed";
}

