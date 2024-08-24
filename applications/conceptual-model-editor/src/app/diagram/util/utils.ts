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


// Slightly modified https://stackoverflow.com/questions/22697936/binary-search-in-javascript
export function binarySearch(arr: [string, number][], val: number) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);

      if (arr[mid]?.[1] === val) {
        return mid;
      }

      if (val < (arr[mid]?.[1] as number)) {
        end = mid - 1;
      } else {
        start = mid + 1;
      }
    }
    return -1;
  }
