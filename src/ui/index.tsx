import "./style.css";
import "./inputs.css";
import { TabNav, TabButton } from "./components/Tabs";
import ReactDOM from "react-dom/client";
import TaggingTab from "./tabs/tagging";
import ExportingTab from "./tabs/exporting";
import IdManagementTab from "./tabs/ids";
import { useEffect, useState } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import ShapesTab from "./tabs/shape";
import TextTab from "./tabs/text";
import ImagesTab from "./tabs/image";

const tabs = [
  {
    id: "shape",
    button: "Shapes",
    Component: ShapesTab,
  },
  {
    id: "text",
    button: "Text",
    Component: TextTab,
  },
  {
    id: "images",
    button: "Images",
    Component: ImagesTab,
  },
  {
    id: "element-tagging",
    button: "Tags",
    Component: TaggingTab,
    dividerLeft: 10,
  },
  {
    id: "ids",
    button: "IDs",
    Component: IdManagementTab,
  },
  {
    id: "exporting",
    button: "Export",
    Component: ExportingTab,
    dividerLeft: 10,
    dividerRight: 0,
  },

];

function App() {
  const [isLoading, setIsLoading] = useState(false);

  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;

      if (msg.type === "done") {
        setIsLoading(false);
      }
    };

    return () => {
      window.onmessage = null;
    };
  }, []);

  return (
    <>
      <TabNav>
        {tabs.map((tab) => (
        <div style={{marginLeft: tab.dividerLeft || 0, marginRight: tab.dividerRight || 0}}>
          <TabButton
            id={tab.id}
            text={tab.button}
            key={tab.id}
            activeTabId={activeTabId}
            onClick={() => setActiveTabId(tab.id)}
          />
        </div>
        ))}
      </TabNav>
      <main id="tabs">
        {tabs.map(
          (tab) =>
            tab.id == activeTabId && (
              <tab.Component setLoading={setIsLoading} key={tab.id} />
            ),
        )}
      </main>
      {isLoading && <LoadingSpinner />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
