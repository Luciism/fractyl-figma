export function variableReferenceName(collectionName: string, variableName: string) {
    
    return collectionName.toLowerCase().replace(" ", "-")
        + "."
        + variableName.toLowerCase().replace(" ", "-");
} 

import { VariableExportSetting } from "../shared/types";
import { VariableSchema } from "../shared/schema-types";
import { rgbaToHex, rgbToHex } from "../code/export/color";

function isObjectRGBA(obj: object): obj is {r: number, g: number, b: number, a: number} {
    return Object.prototype.hasOwnProperty.call(obj, "r")
        && Object.prototype.hasOwnProperty.call(obj, "g")
        && Object.prototype.hasOwnProperty.call(obj, "b")
        && Object.prototype.hasOwnProperty.call(obj, "a");
}

function isObjectRGB(obj: object): obj is {r: number, g: number, b: number} {
    return Object.prototype.hasOwnProperty.call(obj, "r")
        && Object.prototype.hasOwnProperty.call(obj, "g")
        && Object.prototype.hasOwnProperty.call(obj, "b");
}

function isObjectVariableAlias(obj: object): obj is {type: "VARIABLE_ALIAS", id: string} {
    return Object.prototype.hasOwnProperty.call(obj, "type")
        && Object.prototype.hasOwnProperty.call(obj, "id")
        // @ts-expect-error Always exists
        && obj.type === "VARIABLE_ALIAS";
}


export async function aggregateExportVariables(exportSettings: VariableExportSetting): Promise<VariableSchema[]> {
    const collections = (await Promise.all(exportSettings.collectionIds.map(
        id => figma.variables.getVariableCollectionByIdAsync(id)
    ))).filter(collection => collection !== null);

    let variableIds: string[] = exportSettings.variableIds.slice();

    collections.forEach(collection => {
        variableIds = variableIds.concat(collection.variableIds);
    });

    const variables = await Promise.all(variableIds.map(async id => {
        const variable = await figma.variables.getVariableByIdAsync(id);

        if (variable === null) {
            return null;
        }
        const collection = await figma.variables.getVariableCollectionByIdAsync(variable.variableCollectionId);


        if (collection === null) {
            return null;
        }


        const getVariableStringValue = async (variable: Variable, collection: VariableCollection) => {
            const modeId = collection.defaultModeId;
            const value = variable.valuesByMode[modeId].valueOf();

            switch (typeof value) {
                case "string":
                case "number":
                case "boolean":
                    return value.toString();
                case "object":
                    if (isObjectRGBA(value)) {
                        return rgbaToHex(value, true);
                    }

                    if (isObjectRGB(value)) {
                        return rgbToHex(value.r, value.g, value.b);
                    } 

                    if (isObjectVariableAlias(value)) {
                        const aliasedVariable = await figma.variables.getVariableByIdAsync(value.id);
                        if (aliasedVariable === null) {
                            return "unknown-alias"
                        }

                        const aliasedVariableCollection = await figma.variables.getVariableCollectionByIdAsync(
                            aliasedVariable.variableCollectionId
                        );
                        if (aliasedVariableCollection === null) {
                            return "unknown-alias"
                        }

                        return await getVariableStringValue(aliasedVariable, aliasedVariableCollection);
                    }

                    return "";
            }
        }

        const parsedValue = await getVariableStringValue(variable, collection);

        return {
            name: variableReferenceName(collection.name, variable.name),
            value: parsedValue
        }
    }));

    return variables.filter(variable => variable !== null);
}


