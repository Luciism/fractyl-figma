import { useEffect } from "react";

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

export default function ExportingTab({
    setLoading,
}: {
    setLoading: (isLoading: boolean) => void;
}) {
    const executeRasterizeStatic = () => {
        setLoading(true);
        parent.postMessage({ pluginMessage: { type: "rasterize-static" } }, "*");
    };

    const executeExportDynamicTemplate = () => {
        setLoading(true);
        parent.postMessage(
            { pluginMessage: { type: "export-dynamic-template" } },
            "*",
        );
    };

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            const msg = event.data.pluginMessage;

            if (msg.type === "static-rendered") {
                const filename = msg.filename;
                const image = msg.image;

                const blob = new Blob([image], { type: "image/png" });
                downloadBlob(blob, filename);
                return;
            }

            if (msg.type === "dynamic-export") {
                const files = msg.files;

                files.forEach(
                    (file: { file: string; type: string; filename: string }) => {
                        const blob = new Blob([file.file], { type: file.type });
                        downloadBlob(blob, file.filename);
                    },
                );
                return;
            }
        };
        window.addEventListener("message", onMessage);

        return () => window.removeEventListener("message", onMessage);
    }, []);

    return (
        <div className="tab">
            <h2>Exporting</h2>

            <form onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="rasterize-static-btn">Rasterize Selection</label>
                <button onClick={executeRasterizeStatic} id="rasterize-static-btn">Rasterize static layers</button>

                <label htmlFor="export-templates-btn">Export Dynamic Templates</label>
                <button onClick={executeExportDynamicTemplate} id="export-templates-btn">
                    Export Dynamic Template
                </button>
            </form>

        </div>
    );
}
