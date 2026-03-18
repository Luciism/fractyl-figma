import JSZip from "jszip";
import generateSchema, { generateLayoutSchema } from "../schema";
import exportDynamicFragments from "./dynamic";
import exportRasterizedStaticElements from "./static";
import { getExportSettings } from "../exportSettings";
import { aggregateExportVariables } from "../../shared/variables";


export default async function completeExport(masterNode: SceneNode) {
    const exportSettings = getExportSettings();
    await aggregateExportVariables(exportSettings.includedVariables);

    const layoutSchemas = await Promise.all(exportSettings.scales.map(async (scale, i) => {
        const fragments = await exportDynamicFragments(masterNode, scale);
        const statics = await exportRasterizedStaticElements(masterNode, scale);

        return {schema: generateLayoutSchema({id: i, scale: {
            id: scale.id,
            name: scale.name,
            isDefault: scale.isDefault,
            scale: scale.scale
        },
            ...statics.schemas,
            ...fragments.schemas
        }), files: [...fragments.files, ...statics.files]};
    }));

    const schema = generateSchema({
        name: masterNode.name,
        layouts: layoutSchemas.map(layout => layout.schema),
        variables: await aggregateExportVariables(exportSettings.includedVariables)}
    ); // TODO: variables

    const zip = new JSZip();
    zip.file("schema.json", JSON.stringify(schema))

    layoutSchemas.forEach(layout => {
        layout.files.forEach(file => {
            zip.file(file.filename, file.file);
        });
    });

    if (typeof setImmediate === "undefined") {
      // @ts-expect-error setImmediate is not defined in browser typings
      globalThis.setImmediate = fn => setTimeout(fn, 0);
    }

    let promise = null;
    if (JSZip.support.uint8array) {
      promise = zip.generateAsync({type : "uint8array"});
    } else {
      promise = zip.generateAsync({type : "string"});
    }

    const zipFile = await promise;

    const filename = masterNode.name.replace(/\s+/g, "-").toLowerCase();
    figma.ui.postMessage({type: "complete-export", zipFile, filename});
}

