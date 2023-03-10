import { LocalStore } from "../models/local-store";

function createUniqueIdentifier(): string {
    return Date.now() +
        "-xxxx-xxxx-yxxx".replace(/[xy]/g, (pattern) => {
            const code = (Math.random() * 16) | 0;
            const result = pattern == "x" ? code : (code & 0x3) | 0x8;
            return result.toString(16);
        });
}

function cloneAndReplace<T>(obj: T, replaceMap: Map<string, string>): T {
    if (typeof obj === "string") {
        if (replaceMap.has(obj)) {
            return replaceMap.get(obj) as T;
        }
    } else if (Array.isArray(obj)) {
        const result = [];
        for (let i = 0; i < obj.length; i++) {
            result[i] = cloneAndReplace(obj[i], replaceMap);
        }
        return result as T;
    } else if (typeof obj === "object" && obj !== null) {
        const result = {} as Record<string, unknown>;
        for (const key of Object.keys(obj)) {
            const newKey = replaceMap.has(key) ? replaceMap.get(key) as string : key;
            result[newKey] = cloneAndReplace(obj[key as keyof typeof obj], replaceMap);
        }
        return result as T;
    }

    return obj;
}

/**
 * Copies the contents of one store to another, but changes the IRIs of the resources.
 */
export function copyStore(from: LocalStore, to: LocalStore, entityMap: Map<string, string>) {
    const iris = Object.keys(from.memoryStore.resources);

    for (const iri of iris) {
        if (!entityMap.has(iri)) {
            // Replace last part of IRI with a unique identifier
            entityMap.set(iri, iri.replace(/\/[^/]*$/, `/${createUniqueIdentifier()}`));
        }
    }

    to.memoryStore.resources = cloneAndReplace(from.memoryStore.resources, entityMap);
    to.memoryStore.operations = cloneAndReplace(from.memoryStore.operations, entityMap);
}