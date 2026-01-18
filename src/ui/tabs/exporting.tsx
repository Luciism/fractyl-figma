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

          files.forEach((file: {file: string, type: string, filename: string}) => {
            const blob = new Blob([file.file], { type: file.type });
            downloadBlob(blob, file.filename);
          });
          return;
        }
    };
    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="tab">
      <h2>Exporting</h2>

      <p>Rasterize selection:</p>
      <button onClick={executeRasterizeStatic}>Rasterize static layers</button>
      <button onClick={executeExportDynamicTemplate}>
        Export Dynamic Template
      </button>
    </div>
  );
}

