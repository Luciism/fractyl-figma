import {
    FractylExportSchema,
    ShapeFragmentSchema,
    TextFragmentSchema,
    ContentBoxSchema,
    ImageFragmentSchema,
    StaticBaseSchema,
    RasterSizeSchema,
    VariableSchema,
    LayoutSchema,
    ScaleSchema,
    
} from "../shared/schema-types";


const generateRandomString = (length: number) => {
    let result = '';
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export function generateLayoutSchema({
    id,
    scale,
    contentBox,
    rasterSize,
    staticBase,
    textFragments,
    imageFragments,
    shapeFragments,
}: {
    id: number;
    scale: ScaleSchema;
    contentBox: ContentBoxSchema;
    rasterSize: RasterSizeSchema;
    staticBase: StaticBaseSchema;
    textFragments: TextFragmentSchema[];
    imageFragments: ImageFragmentSchema[];
    shapeFragments: ShapeFragmentSchema[];
}): LayoutSchema {
    const schema: LayoutSchema = {
        id,
        scale,
        contentBox,
        rasterSize,
        staticBase,
        fragments: {
            images: imageFragments,
            text: textFragments,
            shapes: shapeFragments,
        },
    };

    return schema;
}

export default function generateSchema({
    name,
    variables,
    layouts
}: {
    name: string;
    variables: VariableSchema[];
    layouts: LayoutSchema[];
}): FractylExportSchema {
    const schema: FractylExportSchema = {
        schemaVersion: 2,
        id: generateRandomString(32),  // Crypto not available
        name,
        variables,
        layouts,
    };

    return schema;
}
