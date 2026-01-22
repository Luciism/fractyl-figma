import { ImageFragmentSchema, ShapeFragmentSchema, TextFragmentSchema } from "../../shared/schema-types.ts";
import { NodePluginData } from "../../shared/types.ts";
import { getNodeId } from "../ids.ts";
import { getColorMode, getShapeHeightMode, getShapeWidthMode } from "../modes.ts";
import getTaggedNodes from "../tagging.ts";
import { recursivelyRemoveStaticColors } from "./color.ts";
import exportImageFragments from "./dynamic/images.ts";
import { rectangleToSVG } from "./dynamic/shapes/rect.ts";
import exportTextFragments from "./dynamic/text.ts";

function exportShapes(masterNode: SceneNode, taggedNodes: SceneNode[]) {
    const shapeFragmentSvgs: {svgCode: string, pluginData: NodePluginData, schema: ShapeFragmentSchema}[] = [];

    taggedNodes.filter(node => node.type == "RECTANGLE").forEach(node => {
        if (typeof node.fills != "symbol" && node.fills[0] && node.fills[0].type != "IMAGE") {
            const fragment = rectangleToSVG(node);

            let [x, y]: [number, number] = [0, 0];
            const box = node.absoluteBoundingBox;

            if (box) {
                x = box.x - masterNode.x;
                y = box.y - masterNode.y;
            }

            const id = getNodeId(node) || Math.round(Math.random() * 10000);
            const schema = {
                src: `shapes/rect-${id}.svg`,
                widthMode: getShapeWidthMode(node),
                heightMode: getShapeHeightMode(node),
                colorMode: getColorMode(node),
                position: {x, y},
                placeholders: fragment.placeholders
            };

            shapeFragmentSvgs.push({...fragment, schema});
        }
    });

    return shapeFragmentSvgs;
}

export default async function exportDynamicFragments(
    node: SceneNode,
): Promise<{schemas: {textFragments: TextFragmentSchema[], imageFragments: ImageFragmentSchema[], shapeFragments: ShapeFragmentSchema[]}, files: {filename: string, type: string, file: string | Uint8Array}[]}> {
    const clone = node.clone();

    const taggedNodes = getTaggedNodes([clone]);
    recursivelyRemoveStaticColors(taggedNodes, clone);

    const textFragments = exportTextFragments(clone, taggedNodes.filter(node => node.type == "TEXT"));
    const imageFragments = exportImageFragments(clone, taggedNodes.filter(node => node.type == "RECTANGLE"));

    const shapeFragments = exportShapes(clone, taggedNodes);

    clone.remove();

    const files = [
        {
            filename: "text-fragments.svg",
            type: "image/svg",
            file: textFragments.svgCode,
        },
        {
            filename: "image-fragments.svg",
            type: "image/svg",
            file: imageFragments.svgCode,
        }
    ].concat(
        shapeFragments.map(fragment => {
            return {
                filename: fragment.schema.src,
                type: "image/svg",
                file: fragment.svgCode,
            }
        })
    );

    return {
        schemas: {
            imageFragments: [imageFragments.schema],
            textFragments: [textFragments.schema],
            shapeFragments: shapeFragments.map(frag => frag.schema)
        },
        files
    };
}
