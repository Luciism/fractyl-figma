export function setLastActiveTab(tabId: string) {
    figma.root.setSharedPluginData("fractyl", "lastActiveTab", tabId);
}

export function getLastActiveTab(): string | null {
    return figma.root.getSharedPluginData("fractyl", "lastActiveTab");
}
