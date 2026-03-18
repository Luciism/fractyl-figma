import { GlobalExportSettings, UpdateGlobalExportSettings } from "../shared/types";

export function defaultExportSettings(): GlobalExportSettings {
    return {
        includedVariables: {collectionIds: [], variableIds: []},
        scales: [{ id: 0, name: "regular", scale: 1.0, isDefault: true }]
    }
}

export function parseExportSettings(stringifiedExportSettings: string): GlobalExportSettings {
    let exportSettings;
    try {
        exportSettings = JSON.parse(stringifiedExportSettings);
    } catch (_) {
        return defaultExportSettings();
    }

    if (
        exportSettings.includedVariables === undefined
        || exportSettings.scales === undefined
        || exportSettings.scales.length === 0
    ) {
        return defaultExportSettings();
    }

    return exportSettings;
}

export function getExportSettings(): GlobalExportSettings {
    const exportSettings = figma.root.getSharedPluginData("fractyl", "exportSettings");
    return exportSettings ? parseExportSettings(exportSettings) : defaultExportSettings();
}

export function updateExportSettings(exportSettings: UpdateGlobalExportSettings) {
    const existingSettings = getExportSettings();

    figma.root.setSharedPluginData("fractyl", "exportSettings", JSON.stringify({
        ...existingSettings,
        ...exportSettings
    }));
} 

