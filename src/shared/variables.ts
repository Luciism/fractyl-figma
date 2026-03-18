export function variableReferenceName(collectionName: string, variableName: string) {
    
    return collectionName.toLowerCase().replace(" ", "-")
        + "."
        + variableName.toLowerCase().replace(" ", "-");
} 
