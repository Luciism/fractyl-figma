import "./style.css";
import { TabNav, TabButton } from "./components/Tabs";
import ReactDOM from "react-dom/client";
import TaggingTab from "./tabs/tagging";
import ExportingTab from "./tabs/exporting";
import IdManagementTab from "./tabs/ids";
import { useEffect, useState } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

const tabs = [
  {
    id: "element-tagging",
    button: "Tagging",
    Component: TaggingTab,
  },
  {
    id: "exporting",
    button: "Exporting",
    Component: ExportingTab,
  },
  {
    id: "ids",
    button: "IDs",
    Component: IdManagementTab,
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
          <TabButton
            id={tab.id}
            text={tab.button}
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
          />
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
