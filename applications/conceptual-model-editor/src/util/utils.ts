export const shortenStringTo = (modelId: string | null, length: number = 20) => {
    if (!modelId) {
        return modelId;
    }
    const modelName = modelId.length > length ? `...${modelId.substring(modelId.length - (length - 3))}` : modelId;
    return modelName;
};

export function compareMaps<T>(oneMap: Map<string, T>, anotherMap: Map<string, T>) {
    if (oneMap.size != anotherMap.size) {
        return false;
    }
    for (const [key, value] of oneMap) {
        if (anotherMap.get(key) != value) {
            console.log("maps have differing value for key", key, value, anotherMap.get(key));
            return false;
        }
    }
    return true;
}
