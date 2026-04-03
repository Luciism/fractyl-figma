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
    shouldColorMatchShadow: boolean;
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

export type ScaleExportSetting = {
    id: number;
    name: string;
    scale: number;
    isEnabled: boolean;
    isDefault: boolean;
}

export type VariableExportSetting = {
    /** Complete collections of variables to include */
    collectionIds: string[];
    /** Additional independent variables that aren't included in a complete collection. */
    variableIds: string[];
}

export type GlobalExportSettings = {
    includedVariables: VariableExportSetting;
    scales: ScaleExportSetting[];
    backgroundVariant: BackgroundTemplateSetting;
}

export type UpdateGlobalExportSettings = {
    includesVariables?: VariableExportSetting;
    scales?: ScaleExportSetting[];
    backgroundVariant?: BackgroundTemplateSetting;
}

export type BackgroundTemplateSetting = {
    enabled: boolean;
    passThrough: number;
};


type VariableResolvedDataType = 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'
type VariableValue = boolean | string | number | RGB | RGBA | VariableAlias;
export type Variable = {
    id: string;
    name: string;
    key: string;
    description: string;
    variableCollectionId: string;
    resolvedType: VariableResolvedDataType;
    valuesByMode: {
        [modeId: string]: VariableValue
    };
}

export type VariableCollection = {
    id: string;
    name: string;
    key: string;
    variables: Variable[];
}
