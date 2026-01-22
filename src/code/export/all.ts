import JSZip from "jszip";
import generateSchema from "../schema";
import exportDynamicFragments from "./dynamic";
import exportRasterizedStaticElements from "./static";

export default async function completeExport(masterNode: SceneNode) {
    const zip = new JSZip();

    const fragments = await exportDynamicFragments(masterNode);
    const statics = await exportRasterizedStaticElements(masterNode);

    const schema = generateSchema({...statics.schemas, ...fragments.schemas});
    zip.file("schema.json", JSON.stringify(schema))

    fragments.files.forEach(file => {
        zip.file(file.filename, file.file);
    });

    statics.files.forEach(file => {
        zip.file(file.filename, file.file);
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

