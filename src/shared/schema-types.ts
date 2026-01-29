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

export type StaticBaseSchema = {
    opaque: string;
    translucent: string;
    mask: string;
}

export type FragmentsSchema = {
    text: TextFragmentSchema[];
    images: ImageFragmentSchema[];
    shapes: ShapeFragmentSchema[];
}

export type FractylExportSchema = {
    schemaVersion: number;
    id: string,
    name: string;
    rasterSize: RasterSizeSchema;
    contentBox: ContentBoxSchema;
    staticBase: StaticBaseSchema;
    fragments: FragmentsSchema;
}
