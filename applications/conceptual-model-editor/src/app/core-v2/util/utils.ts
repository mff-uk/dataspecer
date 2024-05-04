export const shortenStringTo = (modelId: string | null, length: number = 20) => {
    if (!modelId) {
        return modelId;
    }
    const modelName = modelId.length > length ? `...${modelId.substring(modelId.length - (length - 3))}` : modelId;
    return modelName;
};

export const cardinalityToString = (cardinality: [number, number | null] | undefined | null) => {
    if (!cardinality) {
        return undefined;
    }
    return `[${cardinality.at(0) ?? "*"}..${cardinality[1] ?? "*"}]`;
};

// --- dialogs --- --- ---

export const clickedInside = (rect: DOMRect, cliX: number, cliY: number) => {
    const offset = 15;
    return (
        rect.top + offset <= cliY &&
        cliY <= rect.top + rect.height + offset &&
        rect.left - offset <= cliX &&
        cliX <= rect.left + rect.width + offset
    );
};
