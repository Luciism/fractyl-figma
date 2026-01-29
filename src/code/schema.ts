import {
  FractylExportSchema,
  ShapeFragmentSchema,
  TextFragmentSchema,
  ContentBoxSchema,
  ImageFragmentSchema,
  StaticBaseSchema,
  RasterSizeSchema,
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

export default function generateSchema({
  name,
  contentBox,
  rasterSize,
  staticBase,
  textFragments,
  imageFragments,
  shapeFragments,
}: {
  name: string;
  contentBox: ContentBoxSchema;
  rasterSize: RasterSizeSchema;
  staticBase: StaticBaseSchema;
  textFragments: TextFragmentSchema[];
  imageFragments: ImageFragmentSchema[];
  shapeFragments: ShapeFragmentSchema[];
}): FractylExportSchema {
  const schema: FractylExportSchema = {
    schemaVersion: 1,
    id: generateRandomString(32),  // Crypto not available
    name,
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

