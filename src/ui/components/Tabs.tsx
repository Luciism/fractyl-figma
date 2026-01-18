import { ReactNode } from "react";

export function TabButton({text, id, onClick}: {text: string, id: string, onClick: () => void}) {
    return (
          <button data-tab-id={id} onClick={onClick}>{text}</button>
    );
}


export function TabNav({children}: {children: ReactNode}) {
    return (
        <nav className="tab-menu">
            {children}
        </nav>
    );
}
