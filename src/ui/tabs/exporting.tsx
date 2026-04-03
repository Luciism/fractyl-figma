import { useEffect, useState } from "react";
import "./exporting.css";
import { MdiAdd, MdiTrash, MdiEdit } from "../icons";
import VariableSelector from "./exporting/variables";
import { GlobalExportSettings, ScaleExportSetting, VariableCollection, VariableExportSetting } from "../../shared/types";
import { variableReferenceName } from "../../shared/variables";

function downloadBlob(blob: Blob, filename: string) {
    const fileURL = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = fileURL;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    setTimeout(() => {
        URL.revokeObjectURL(fileURL);
    }, 1000);
}

function ExportScaleSetting({ scale, updateScale, deleteScale }: {
    scale: ScaleExportSetting,
    updateScale: (id: number, name: string, value: number, isEnabled: boolean) => void,
    deleteScale: (id: number) => void
}
) {
    const [name, setName] = useState(scale.name);
    const [scaleValue, setScaleValue] = useState(scale.scale);
    const [isEnabled, setIsEnabled] = useState(scale.isEnabled);

    return (
        <div className={`export-scale-container ${!isEnabled && !scale.isDefault ? "disabled": ""}`}>
            <input
                className="scale-enabled-checkbox"
                type="checkbox"
                checked={isEnabled || scale.isDefault}
                onChange={(e) => {
                    setIsEnabled(e.target.checked);
                    updateScale(scale.id, name, scaleValue, e.target.checked);
                }}
                disabled={scale.isDefault}
            />
            <input
                type="text"
                className="scale-name-input"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                    setName(e.target.value.toLowerCase().replace(" ", "-"));
                }}
                onBlur={() => updateScale(scale.id, name, scaleValue, isEnabled)}
            />
            <input
                type="text"
                className="scale-value-input"
                value={scaleValue + "x"}
                onBlur={() => updateScale(scale.id, name, scaleValue, isEnabled)}
                onKeyDown={(e) => {
                    if (e.key == "Backspace") {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.value = e.currentTarget.value.slice(0, -2) + "x";
                        return;
                    }

                    if (e.key == ".") {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.value = e.currentTarget.value.slice(0, -1) + ".x";
                        return;
                    }
                }}
                onChange={(e) => {
                    if (e.target.value && e.target.validity.valid) {
                        setScaleValue(parseFloat(e.target.value.replace("x", "")) || 0);
                    }
                }}
            />
            <button
                className="delete-scale-button"
                disabled={scale.isDefault}
                onClick={() => deleteScale(scale.id)}
            >
                <MdiTrash />
            </button>
        </div>
    )
}

function getIncludedVariableRepresentations(
    includedVariables: VariableExportSetting,
    localVariableCollections: VariableCollection[]
) {
    const localVariables = localVariableCollections.flatMap(collection => collection.variables);

    const representations = includedVariables.variableIds.map(variableId => {
        const variable = localVariables.find(variable => variable.id === variableId);
        const collection = localVariableCollections.find(
            collection => collection.id === variable?.variableCollectionId
        );
        if (!variable || !collection) {
            return null;
        }

        return variableReferenceName(collection.name, variable.name);
    }).concat(includedVariables.collectionIds.map(collectionId => {
        const collection = localVariableCollections.find(collection => collection.id === collectionId);                                
        if (!collection) {
            return null;
        }
        return collection.variables.map(variable => variableReferenceName(collection.name, variable.name));
    }).flat()).filter(v => v !== null);

    return new Array(...new Set(representations));
}

export default function ExportingTab({
    setLoading,
}: {
    setLoading: (isLoading: boolean) => void;
}) {
    // Export settings
    const [scales, setScales] = useState<ScaleExportSetting[]>(
        [{ id: 0, name: "regular", scale: 1.0, isDefault: true, isEnabled: true }]
    );
    const [includedVariables, setIncludedVariables] = useState<VariableExportSetting>(
        {variableIds: [], collectionIds: []}
    );
    const [exportSettings, setExportSettings] = useState<GlobalExportSettings | null>(null);

    const [localVariableCollections, setLocalVariableCollections] = useState<VariableCollection[]>([]);

    const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);

    const [enableBackgroundVariant, setEnableBackgroundVariant] = useState(true);
    const [backgroundVariantPassThrough, setBackgroundVariantPassThrough] = useState(0.2);

    const executeCompleteExport = () => {
        setLoading(true);
        parent.postMessage(
            { pluginMessage: { type: "complete-export" } },
            "*",
        );
    };

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "complete-export") {
                const zipFile = msg.zipFile;

                const blob = new Blob([zipFile], { type: "application/zip" });
                downloadBlob(blob, msg.filename);
                return;
            }

            if (msg.type === "get-export-settings") {
                setExportSettings(msg.exportSettings);
                setScales(msg.exportSettings.scales);
                setIncludedVariables(msg.exportSettings.includedVariables);
                setEnableBackgroundVariant(msg.exportSettings.backgroundVariant.enabled);
                setBackgroundVariantPassThrough(msg.exportSettings.backgroundVariant.passThrough);
                return;
            }

            if (msg.type === "get-variables") {
                setLocalVariableCollections(msg.collections);
                return;
            }
        };
        window.addEventListener("message", onMessage);

        parent.postMessage(
            { pluginMessage: { type: "get-export-settings" } },
            "*",
        );
        parent.postMessage(
            { pluginMessage: { type: "get-variables" } },
            "*",
        );

        return () => window.removeEventListener("message", onMessage);
    }, []);

    const updateScale = (id: number, name: string, value: number, isEnabled: boolean) => {
        const updatedScales = scales.map(scale => {
            if (scale.id === id) {
                return { ...scale, name, scale: value, isEnabled };
            }
            return scale;
        });
        setScales(updatedScales);

        parent.postMessage(
            { pluginMessage: { type: "update-export-settings", exportSettings: {scales: updatedScales} } },
            "*",
        );
    }

    const updateBackgroundVariant = (enabled: boolean, passThrough: number) => {
        passThrough = Math.max(0, Math.min(1, passThrough));

        setEnableBackgroundVariant(enabled);
        setBackgroundVariantPassThrough(passThrough);

        parent.postMessage(
            { pluginMessage: { type: "update-export-settings", exportSettings: {backgroundVariant: {enabled, passThrough}} } },
            "*",
        );
    }

    const deleteScale = (id: number) => {
        const updatedScales = scales.filter(scale => scale.id !== id);
        setScales(updatedScales);
        parent.postMessage(
            { pluginMessage: { type: "update-export-settings", exportSettings: {scales: updatedScales} } },
            "*",
        );
    }

    const createScale = () => {
        const updatedScales = [...scales, {
            id: scales.length + 1,
            name: `scale${scales.length + 1}`,
            scale: 1.0,
            isDefault: false,
            isEnabled: true
        }];
        setScales(updatedScales);
        parent.postMessage(
            { pluginMessage: { type: "update-export-settings", exportSettings: {scales: updatedScales} } },
            "*",
        );
    }

    return (
        <>
            {!exportSettings || !localVariableCollections.length &&
                <div className="tab">Loading...</div>
            }
            {exportSettings && localVariableCollections.length &&
                <div className="tab">
                    <h2>Exporting</h2>

                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="manage-variables-button" className="divider-label">
                            <span>Variables</span>
                        </label>
                        
                        <ul className="included-variables-list">
                            {getIncludedVariableRepresentations(includedVariables, localVariableCollections)
                                .map(representation => <li key={representation}>{representation}</li>)}
                        </ul>

                        <button
                            id="manage-variables-button"
                            className="add-export-setting-button"
                            onClick={() => {
                                setVariableSelectorOpen(true);
                            }}
                        >
                            <MdiEdit className="icon" />
                            <span>Manage Variables</span>
                        </button>
                        {variableSelectorOpen && <VariableSelector
                            includedVariables={includedVariables}
                            setIncludedVariables={setIncludedVariables}
                            isOpen={variableSelectorOpen}
                            setIsOpen={setVariableSelectorOpen}
                        />}

                        <label htmlFor="add-scale-button" className="divider-label">
                            <span>Scales</span>
                        </label>

                        {scales.map(scale => <ExportScaleSetting
                            scale={scale}
                            key={scale.name}
                            updateScale={updateScale}
                            deleteScale={deleteScale}
                        />)}

                        <button
                            id="add-scale-button"
                            className="add-export-setting-button"
                            onClick={createScale}
                        >
                            <MdiAdd className="icon" />
                            <span>Add Scale</span>
                        </button>


                        <label htmlFor="toggle-background-variant-checkbox" className="divider-label">
                            <span>Background Variant</span>
                        </label>

                        <div className="checkbox background-variant-setting">
                            <label htmlFor="toggle-background-variant-checkbox">Enable</label>
                            <input
                                type="checkbox"
                                id="toggle-background-variant-checkbox"
                                checked={enableBackgroundVariant}
                                onChange={() => updateBackgroundVariant(!enableBackgroundVariant, backgroundVariantPassThrough)}
                            />
                        </div>

                        <div className="checkbox background-variant-setting">
                            <label htmlFor="background-variant-pass-through">Pass Through</label>
                            <input
                                id="background-variant-pass-through"
                                type="number"
                                value={backgroundVariantPassThrough}
                                onChange={e => setBackgroundVariantPassThrough(Number(e.target.value))}
                                onBlur={() => updateBackgroundVariant(enableBackgroundVariant, backgroundVariantPassThrough)}
                                min="0"
                                max="1"
                                step="0.1"
                            />
                        </div>

                        <label htmlFor="" className="divider-label"></label>

                        <button onClick={executeCompleteExport} id="complete-export-btn" type="submit">
                            Complete Export
                        </button>
                    </form>

                </div>}
        </>
    );
}
