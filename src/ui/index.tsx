import "./style.css";
import { TabNav, TabButton } from "./components/Tabs";
import ReactDOM from "react-dom/client";
import TaggingTab from "./tabs/tagging";
import ExportingTab from "./tabs/exporting";
import { useEffect, useState } from "react";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const tabs = [
    {
      id: "element-tagging",
      button: "Tagging",
      tab: <TaggingTab setLoading={setIsLoading} />,
    },
    {
      id: "exporting",
      button: "Exporting",
      tab: <ExportingTab setLoading={setIsLoading} />,
    },
  ];
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
            onClick={() => setActiveTabId(tab.id)}
          />
        ))}
      </TabNav>
      <main id="tabs">
        {tabs.filter((tab) => tab.id == activeTabId).map((tab) => tab.tab)}
      </main>
      {isLoading && <div id="loading-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
            opacity="0.5" />
          <path fill="currentColor" d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z">
            <animateTransform attributeName="transform" dur="1s" from="0 12 12" repeatCount="indefinite" to="360 12 12"
              type="rotate" />
          </path>
        </svg>
      </div>}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
