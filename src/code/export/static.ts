import {
  ContentBoxSchema,
  RasterSizeSchema,
  StaticBaseSchema,
} from "../../shared/schema-types.ts";
import { ScaleExportSetting } from "../../shared/types.ts";
import { getExportSettings } from "../exportSettings.ts";
import { getNodeId } from "../ids.ts";
import { isStyleableNode } from "../nodes.ts";
import getTaggedNodes from "../tagging.ts";
import { changeNodeFillOpacity } from "./color.ts";

/** Requires rasterizeOpaque() to be called beforehand. */
async function rasterizeTranslucent(clone: FrameNode, parentDir: string, passThrough: number) {
  // Recursively traverses frames to find the first one with a fill.
  // This sets the opacity of each tile
  const recursivelyUnfillBaseFrame = (node: SceneNode) => {
      if (node.type == "INSTANCE") {
        node = node.detachInstance();
      }

      if (node.type == "FRAME") {
        // Ensure it isn't a layout frame
        if (typeof node.fills != "symbol" && node.fills.length) {
          changeNodeFillOpacity(node, 1 - passThrough);
          return;
        }

        node.children.forEach((child) => {
            recursivelyUnfillBaseFrame(child);
        });
      }
  };
  recursivelyUnfillBaseFrame(clone);

  const filename = `${parentDir}/${clone.name}-static-translucent.png`
    .replace(/\s+/g, "-")
    .toLowerCase();
  const file = await clone.exportAsync({ format: "PNG" });

  return { filename, file };
}

async function rasterizeOpaque(clone: FrameNode, parentDir: string) {
  const taggedNodes = getTaggedNodes([clone]);

  taggedNodes.forEach((taggedNode) => {
    if (isStyleableNode(taggedNode) && getNodeId(taggedNode) != null) {
      taggedNode.opacity = 0;
    }
  });

  const filename = `${parentDir}/${clone.name}-static.png`
    .replace(/\s+/g, "-")
    .toLowerCase();
  const file = await clone.exportAsync({ format: "PNG" });

  return { filename, file };
}

async function rasterizeMask(clone: FrameNode, parentDir: string, scale: ScaleExportSetting) {
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

  clone.rescale(scale.scale);


  const filename = `${parentDir}/${clone.name}-mask.png`.replace(/\s+/g, "-").toLowerCase();
  const file = await clone.exportAsync({ format: "PNG" });

  return { filename, file };
}


export default async function exportRasterizedStaticElements(
  node: SceneNode,
  scale: ScaleExportSetting
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
  clone.x = 0;
  clone.y = 10000;
  clone.rescale(scale.scale);

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

  // absoluteRenderBounds on scaled nodes acts strangely, scale it manually
  const nodeBox = node.absoluteRenderBounds;
  const cloneBox = clone.absoluteRenderBounds;

  if (nodeBox && cloneBox) {
    const box = {
        width: nodeBox.width * scale.scale,
        height: nodeBox.height * scale.scale,
        x: cloneBox.x,
        y: cloneBox.y
    };
    rasterSize = {
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
    contentBox.rasterX = Math.round((clone.x - box.x) * scale.scale);
    contentBox.rasterY = Math.round((clone.y - box.y) * scale.scale);
  }

  const exportSettings = getExportSettings();

  const parentDir = scale.name;
  const opaque = await rasterizeOpaque(clone, parentDir);
  let translucent = null;
  let mask = null;

  if (exportSettings.backgroundVariant.enabled) {
      translucent = await rasterizeTranslucent(clone, parentDir, exportSettings.backgroundVariant.passThrough);

      const clone2 = node.clone();
      clone2.x = 0;
      clone2.y = 10000;
      mask = await rasterizeMask(clone2, parentDir, scale);
      clone2.remove();
  }

  clone.remove();

  const files = [opaque];
  if (translucent && mask) {
    files.push(translucent);
    files.push(mask);
  }

  return {
    schemas: {
      name: node.name,
      contentBox,
      rasterSize,
      staticBase: {
        default: opaque.filename,
        background: translucent && mask ? {
          translucent: translucent.filename,
          mask: mask.filename,
        } : null
      },
    },
    files,
  };
}
