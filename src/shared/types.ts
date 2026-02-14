export const modeAttributeValues = ["fixed", "dynamic"] as const;
export type ModeAttribute = typeof modeAttributeValues[number];

export function isModeAttribute(
  value: string
): value is ModeAttribute {
  return modeAttributeValues.includes(
    value as ModeAttribute
  );
}

export const nodeTagTypeValues = ["text", "image", "shape"] as const;
export type NodeTagType = typeof nodeTagTypeValues[number];

export function isNodeTagType(
  value: string
): value is NodeTagType {
  return nodeTagTypeValues.includes(
    value as NodeTagType 
  );
}


export type FractylTextNodeDataAttributes = {
    colorMode: ModeAttribute;
    shouldColorMatchShadow: boolean;
};

export type FractylTextNodeData = {
  id: string | null;
  tag: "text";
  attributes: FractylTextNodeDataAttributes;
};

export type FractylImageNodeData = {
  id: string | null;
  tag: "image";
  attributes: null;
};

export type FractylShapeNodeDataAttributes = {
    widthMode: ModeAttribute;
    heightMode: ModeAttribute;
    colorMode: ModeAttribute;
    shouldClipToParent: boolean;
};

export type FractylShapeNodeData = {
  id: string | null;
  tag: "shape";
  attributes: FractylShapeNodeDataAttributes;
};

export type FractylUntaggedNodeData = {
  id: string | null;
  tag: null;
  attributes: null;
};

export type NodePluginData =
  | FractylTextNodeData
  | FractylImageNodeData
  | FractylShapeNodeData
  | FractylUntaggedNodeData;


export type SvgFragmentExport = {
    svgCode: string;
    // schema: ImageFragmentSchema | TextFragmentSchema | ShapeFragmentSchema;
    placeholders: string[],
    pluginData: NodePluginData;
}

