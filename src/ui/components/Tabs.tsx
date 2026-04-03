import "./Tabs.css";
import { ReactNode } from "react";

export function TabButton({
    text,
    id,
    activeTabId,
    onClick,
    isDebug = false
}: {
    text: string,
    id: string,
    isDebug: boolean,
    activeTabId: string,
    onClick: () => void
}) {
    return (
        <button
            data-tab-id={id}
            onClick={onClick}
            className={(activeTabId == id ? "active" : "") + (isDebug ? " debug" : "")}
        >
            {text}
        </button>
    );
}


export function TabNav({ children }: { children: ReactNode }) {
    return (
        <nav className="tab-menu">
            {children}
        </nav>
    );
}
