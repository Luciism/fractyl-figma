export const shapeDimensionModeValues = ["fixed", "dynamic"] as const;
export type ShapeDimensionMode = typeof shapeDimensionModeValues[number];

export function isShapeDimensionMode(
  value: string
): value is ShapeDimensionMode {
  return shapeDimensionModeValues.includes(
    value as ShapeDimensionMode
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


export type FractylTextNodeData = {
  id: string | null;
  tag: "text";
  attributes: null;
};

export type FractylImageNodeData = {
  id: string | null;
  tag: "image";
  attributes: null;
};

export type FractylShapeNodeDataAttributes = {
    widthMode: ShapeDimensionMode;
    heightMode: ShapeDimensionMode;
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

