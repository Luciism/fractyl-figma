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
    updateScale: (id: number, name: string, value: number) => void,
    deleteScale: (id: number) => void
}
) {
    const [name, setName] = useState(scale.name);
    const [scaleValue, setScaleValue] = useState(scale.scale);

    return (
        <div className="export-scale-container">
            <input
                type="text"
                className="scale-name-input"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                    setName(e.target.value.toLowerCase().replace(" ", "-"));
                }}
                onBlur={() => updateScale(scale.id, name, scaleValue)}
            />
            <input
                type="text"
                className="scale-value-input"
                value={scaleValue + "x"}
                onBlur={() => updateScale(scale.id, name, scaleValue)}
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
        [{ id: 0, name: "regular", scale: 1.0, isDefault: true }]
    );
    const [includedVariables, setIncludedVariables] = useState<VariableExportSetting>(
        {variableIds: [], collectionIds: []}
    );
    const [exportSettings, setExportSettings] = useState<GlobalExportSettings | null>(null);

    const [localVariableCollections, setLocalVariableCollections] = useState<VariableCollection[]>([]);

    const [variableSelectorOpen, setVariableSelectorOpen] = useState(false);

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

    const updateScale = (id: number, name: string, value: number) => {
        const updatedScales = scales.map(scale => {
            if (scale.id === id) {
                return { ...scale, name, scale: value };
            }
            return scale;
        });
        setScales(updatedScales);

        parent.postMessage(
            { pluginMessage: { type: "update-export-settings", exportSettings: {scales: updatedScales} } },
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
            isDefault: false
        }];
        setScales(updatedScales);
        parent.postMessage(
            { pluginMessage: { type: "update-export-settings", exportSettings: {scales: updatedScales} } },
            "*",
        );
    }

    return (
        <>
            {!exportSettings || !localVariableCollections.length && <div className="tab">Loading...</div>}
            {exportSettings && localVariableCollections.length &&
                <div className="tab">
                    <h2>Exporting</h2>

                    <form onSubmit={(e) => e.preventDefault()}>
                        <label htmlFor="">Variables</label>
                        
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

                        <label htmlFor="add-scale-button">Scales</label>

                        {scales.sort((a, b) => a.scale - b.scale).map(scale => <ExportScaleSetting
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

                        <hr />

                        <button onClick={executeCompleteExport} id="complete-export-btn" type="submit">
                            Complete Export
                        </button>
                    </form>

                </div>}
        </>
    );
}
