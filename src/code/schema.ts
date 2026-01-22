import {
  FractylExportSchema,
  ShapeFragmentSchema,
  TextFragmentSchema,
  ContentBoxSchema,
  ImageFragmentSchema,
  StaticBaseSchema,
  RasterSizeSchema,
} from "../shared/schema-types";

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
    schemaVersion: 1, // TODO: add versioning system
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

// export default function generateSchema(
//     masterNode: SceneNode,
//     staticBase: Uint8Array<ArrayBufferLike>,
//     textFragments: [],
//     imageFragments: [],
//     shapeFragments: []
// ) {
//     const name = masterNode.name;
//
//     const reader = new DataView(staticBase.buffer);
//     const rasterSize = {
//       width: reader.getUint32(16, false),
//       height: reader.getUint32(20, false),
//     };
//
//     const contextBox = {
//         width: masterNode.width,
//         height: masterNode.height,
//         rasterX: (rasterSize.width - masterNode.width) / 2,
//         rasterY: (rasterSize.height - masterNode.height) / 2
//     };
// }
