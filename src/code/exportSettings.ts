import { GlobalExportSettings, UpdateGlobalExportSettings } from "../shared/types";

export function defaultExportSettings(): GlobalExportSettings {
    return {
        includedVariables: {collectionIds: [], variableIds: []},
        scales: [{ id: 0, name: "regular", scale: 1.0, isDefault: true, isEnabled: true }],
        backgroundVariant: {enabled: true, passThrough: 0.2}
    }
}

function isExportSettingObject(obj: any): obj is GlobalExportSettings {
    return (
        obj.includedVariables?.collectionIds !== undefined
        && typeof obj.includedVariables.collectionIds.length === "number"

        && obj.includedVariables?.variableIds !== undefined
        && typeof obj.includedVariables.variableIds.length === "number"

        && obj.scales !== undefined
        && typeof obj.scales.length === "number"

        && obj.backgroundVariant !== undefined
        && typeof obj.backgroundVariant.enabled === "boolean"
        && typeof obj.backgroundVariant.passThrough === "number"
    )
}

export function parseExportSettings(stringifiedExportSettings: string): GlobalExportSettings {
    let settings;
    try {
        settings = JSON.parse(stringifiedExportSettings);
    } catch (_) {
        return defaultExportSettings();
    }

    if (!isExportSettingObject(settings) || settings.scales.length == 0) {
        return defaultExportSettings();
    }

    return settings;
}

export function getExportSettings(): GlobalExportSettings {
    const exportSettings = figma.root.getSharedPluginData("fractyl", "exportSettings");
    return exportSettings ? parseExportSettings(exportSettings) : defaultExportSettings();
}

export function updateExportSettings(exportSettings: UpdateGlobalExportSettings) {
    const existingSettings = getExportSettings();

    if (exportSettings.scales) {
        exportSettings.scales = exportSettings.scales.sort((a, b) => a.scale - b.scale);
    }

    figma.root.setSharedPluginData("fractyl", "exportSettings", JSON.stringify({
        ...existingSettings,
        ...exportSettings
    }));
} 

