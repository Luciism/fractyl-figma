import { useEffect, useState } from "react";
import "./variables.css";
import { MdiClose } from "../../icons";
import { Variable, VariableCollection, VariableExportSetting } from "../../../shared/types";

function VariableSelection({
    variable,
    isEntireCollectionIncluded,
    includedVariables,
    setIncludedVariables
}: {
    variable: Variable,
    isEntireCollectionIncluded: boolean,
    includedVariables: VariableExportSetting,
    setIncludedVariables: (includedVariables: VariableExportSetting) => void
}) {
    const [isChecked, setIsChecked] = useState(includedVariables.variableIds.includes(variable.id));
    return (
        <div
            key={variable.id}
            className={`
                variable-selection
                selection-input-wrapper
                ${isChecked || isEntireCollectionIncluded ? "included" : ""}
            `}
        >
            <label htmlFor={`checkbox--${variable.id}`}>{variable.name}</label>
            <input
                type="checkbox"
                id={`checkbox--${variable.id}`}
                disabled={isEntireCollectionIncluded}
                checked={isChecked}
                onChange={e => {
                    setIsChecked(e.target.checked);
                    if (e.target.checked) {
                        setIncludedVariables({
                            collectionIds: includedVariables.collectionIds,
                            variableIds: [...includedVariables.variableIds, variable.id]
                        });
                    } else {
                        setIncludedVariables({
                            collectionIds: includedVariables.collectionIds,
                            variableIds: includedVariables.variableIds.filter(id => id !== variable.id)
                        });
                    }
                }}
            />
        </div>
    );
}

function VariableCollectionSelection({
    collection,
    includedVariables,
    setIncludedVariables
}: {
    collection: VariableCollection,
    includedVariables: VariableExportSetting,
    setIncludedVariables: (includedVariables: VariableExportSetting) => void
}) {
    const [entireCollection, setEntireCollection] = useState(
        includedVariables.collectionIds.includes(collection.id)
    );

    return (
        <div className="collection-selection">
            <div className={`selection-input-wrapper ${entireCollection ? "included" : ""}`}>
                <label htmlFor={`checkbox--${collection.id}`}>{collection.name}</label>
                <input
                    type="checkbox"
                    id={`checkbox--${collection.id}`}
                    checked={entireCollection}
                    onChange={e => {
                        setEntireCollection(e.target.checked);
                        if (e.target.checked) {
                            setIncludedVariables({
                                collectionIds: [...includedVariables.collectionIds, collection.id],
                                variableIds: includedVariables.variableIds
                            });
                        } else {
                            setIncludedVariables({
                                collectionIds: includedVariables.collectionIds.filter(id => id !== collection.id),
                                variableIds: includedVariables.variableIds
                            });
                        }
                    }}
                />
            </div>

            {collection.variables.map((variable, j: number) => (
                <VariableSelection
                    key={j}
                    variable={variable}
                    isEntireCollectionIncluded={entireCollection}
                    includedVariables={includedVariables}
                    setIncludedVariables={setIncludedVariables}
                />
            ))}
        </div>
    );
}

export default function VariableSelector({
    includedVariables,
    setIncludedVariables,
    // isOpen,
    setIsOpen
}: {
    includedVariables: VariableExportSetting,
    setIncludedVariables: (includedVariables: VariableExportSetting) => void,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
}) {
    const [variableCollections, setVariableCollections] = useState([]);

    const setAndUpdateIncludedVariables = (includedVariables: VariableExportSetting) => {
        setIncludedVariables(includedVariables);
        parent.postMessage(
            { pluginMessage: { type: "update-export-settings", exportSettings: { includedVariables } } },
            "*",
        );
    };

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "get-variables") {
                setVariableCollections(msg.collections);
                return;
            }
        };
        window.addEventListener("message", onMessage);

        parent.postMessage(
            { pluginMessage: { type: "get-variables" } },
            "*",
        );

        return () => window.removeEventListener("message", onMessage);
    }, []);

    return (
        <div className="variable-selector-container">
            <div className="popover-header">
                <h3>Include Variables</h3>
                <MdiClose className="close-icon" onClick={() => setIsOpen(false)} />
            </div>
            <div className="popover-content">
                {variableCollections && variableCollections.map((collection, i) => {
                    return <VariableCollectionSelection
                        key={i}
                        collection={collection}
                        includedVariables={includedVariables}
                        setIncludedVariables={setAndUpdateIncludedVariables}
                    />;
                })}
                {
                    !variableCollections.length && <p>No variables found</p>
                }
            </div>
        </div>
    );
}
