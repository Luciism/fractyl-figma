import {
  ContentBoxSchema,
  RasterSizeSchema,
  StaticBaseSchema,
} from "../../shared/schema-types.ts";
import { isStyleableNode } from "../nodes.ts";
import getTaggedNodes from "../tagging.ts";
import { changeNodeFillOpacity } from "./color.ts";

/** Requires rasterizeOpaque() to be called beforehand. */
async function rasterizeTranslucent(clone: FrameNode) {
  // Recursively traverses frames to find the first one with a fill.
  // This sets the opacity of each tile
  const recursivelyUnfillBaseFrame = (node: SceneNode) => {
      if (node.type == "INSTANCE") {
        node = node.detachInstance();
      }

      if (node.type == "FRAME") {
        // Ensure it isn't a layout frame
        if (typeof node.fills != "symbol" && node.fills.length) {
          changeNodeFillOpacity(node, 0.8);
          return;
        }

        node.children.forEach((child) => {
            recursivelyUnfillBaseFrame(child);
        });
      }
  };
  recursivelyUnfillBaseFrame(clone);

  const filename = `${clone.name}-static-translucent.png`
    .replace(/\s+/g, "-")
    .toLowerCase();
  const file = await clone.exportAsync({ format: "PNG" });

  return { filename, file };
}

async function rasterizeOpaque(clone: FrameNode) {
  const taggedNodes = getTaggedNodes([clone]);

  taggedNodes.forEach((taggedNode) => {
    if (isStyleableNode(taggedNode)) {
      taggedNode.opacity = 0;
    }
  });

  const filename = `${clone.name}-static.png`
    .replace(/\s+/g, "-")
    .toLowerCase();
  const file = await clone.exportAsync({ format: "PNG" });

  return { filename, file };
}

async function rasterizeMask(clone: FrameNode) {
  clone.x = 0;
  clone.y = 10000;

  const bounds = clone.absoluteRenderBounds;
  const [absoluteWidth, absoluteHeight] = bounds
    ? [bounds.width, bounds.height]
    : [clone.width, clone.height];

  const recursivelyHideContent = (node: FrameNode | InstanceNode) => {
    node.layoutSizingVertical = "FIXED";
    node.layoutSizingHorizontal = "FIXED";

    node.children.forEach((child) => {
      if (child.type == "INSTANCE") {
        child = child.detachInstance();
      }

      if (child.type != "FRAME") {
        child.remove();
      } else {
        recursivelyHideContent(child);
      }
    });
  };

  recursivelyHideContent(clone);

  const recursivelyRemoveEffects = (node: FrameNode) => {
    node.effects = [];
    node.strokes = [];

    // If node has a fill, make white.
    if (typeof node.fills == "symbol" || node.fills.length) {
      node.fills = [figma.util.solidPaint("#FFFFFF")];
    }

    node.children.forEach((child) => {
      if (child.type == "FRAME") {
        recursivelyRemoveEffects(child);
      }
    });
  };

  recursivelyRemoveEffects(clone);

  if (typeof clone.fills != "symbol" && !clone.fills.length) {
      clone.fills = [figma.util.solidPaint("#000000")];
  }

  // Ensure offset due to effects are accounted for.
  if (absoluteWidth > clone.width) {
    const offset = Math.floor((absoluteWidth - clone.width) / 2);
    clone.paddingLeft += offset;
    clone.paddingRight += offset;
  }

  if (absoluteHeight > clone.height) {
    const offset = Math.floor((absoluteHeight - clone.height) / 2);
    clone.paddingTop += offset;
    clone.paddingBottom += offset;
  }

    clone.resize(absoluteWidth, absoluteHeight);
    clone.primaryAxisAlignItems = "CENTER";
    clone.counterAxisAlignItems = "CENTER";


  const filename = `${clone.name}-mask.png`.replace(/\s+/g, "-").toLowerCase();
  const file = await clone.exportAsync({ format: "PNG" });

  clone.remove();

  return { filename, file };
}

export default async function exportRasterizedStaticElements(
  node: SceneNode,
): Promise<{
  schemas: {
    name: string;
    contentBox: ContentBoxSchema;
    rasterSize: RasterSizeSchema;
    staticBase: StaticBaseSchema;
  };
  files: { filename: string; file: string | Uint8Array }[];
}> {
  if (node.type != "FRAME") {
    throw new Error("Master node must be a frame.");
  }

  const clone = node.clone();

  let rasterSize: RasterSizeSchema = {
    width: Math.round(clone.width),
    height: Math.round(clone.height),
  };
  const contentBox: ContentBoxSchema = {
    width: Math.round(clone.width),
    height: Math.round(clone.height),
    rasterX: 0,
    rasterY: 0,
  };

  const box = clone.absoluteRenderBounds;

  if (box) {
    rasterSize = {
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
    contentBox.rasterX = Math.round(clone.x - box.x);
    contentBox.rasterY = Math.round(clone.y - box.y);
  }

  clone.x = 0;
  clone.y = 10000;

  const opaque = await rasterizeOpaque(clone);
  const translucent = await rasterizeTranslucent(clone);
  const mask = await rasterizeMask(node.clone());

  clone.remove();

  const files = [opaque, translucent, mask];

  return {
    schemas: {
      name: node.name,
      contentBox,
      rasterSize,
      staticBase: {
        opaque: opaque.filename,
        translucent: translucent.filename,
        mask: mask.filename,
      },
    },
    files,
  };
}
