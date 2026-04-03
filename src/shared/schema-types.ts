import { ModeAttribute } from "./types";

export type TextFragmentSchema = {
    src: string;
    position: {
        x: number;
        y: number;
    },
    placeholders: string[]
}

export type ImageFragmentSchema = TextFragmentSchema;


export type ShapeFragmentSchema = {
    src: string;
    position: {
        x: number;
        y: number;
    },
    placeholders: string[],
    widthMode: ModeAttribute,
    heightMode: ModeAttribute,
    colorMode: ModeAttribute
}


export type RasterSizeSchema = {
    width: number;
    height: number;
}

export type ContentBoxSchema = {
    rasterX: number;
    rasterY: number;
    width: number;
    height: number;
}

export type StaticBaseBackgroundSchema = {
    translucent: string;
    mask: string;
};

export type StaticBaseSchema = {
    default: string;
    background: StaticBaseBackgroundSchema | null;
}

export type FragmentsSchema = {
    text: TextFragmentSchema[];
    images: ImageFragmentSchema[];
    shapes: ShapeFragmentSchema[];
}

export type ScaleSchema = {
    id: number;
    name: string;
    isDefault: boolean;
    scale: number;
}

export type LayoutSchema = {
    id: number;
    scale: ScaleSchema;
    rasterSize: RasterSizeSchema;
    contentBox: ContentBoxSchema;
    staticBase: StaticBaseSchema;
    fragments: FragmentsSchema;
}

export type VariableSchema = {
    name: string;
    value: string;
}

export type FractylExportSchema = {
    schemaVersion: number;
    id: string,
    name: string;
    variables: VariableSchema[];
    layouts: LayoutSchema[]
}

