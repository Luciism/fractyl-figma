import "./Tabs.css";
import { ReactNode } from "react";

export function TabButton({text, id, activeTabId, onClick}: {text: string, id: string, activeTabId: string, onClick: () => void}) {
    return (
      <button
        data-tab-id={id}
        onClick={onClick}
        className={activeTabId == id ? "active" : ""}
      >
        {text}
      </button>
    );
}


export function TabNav({children}: {children: ReactNode}) {
    return (
        <nav className="tab-menu">
            {children}
        </nav>
    );
}
