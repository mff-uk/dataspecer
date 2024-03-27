import Mustache from "mustache";

/**
 * Wrapper over Mustache.render that can handle asyc functions in the view.
 */
export async function renderAsyncMustache(
    template: string,
    view: any,
    partials?: Mustache.PartialsOrLookupFn,
    tagsOrOptions?: Mustache.OpeningAndClosingTags | Mustache.RenderOptions
): Promise<string> {
    const promiseResolver = new SyncPromiseResolver(view);
    let result: string;
    do {
        result = Mustache.render(
            template,
            await promiseResolver.getWrappedObject(),
            partials,
            tagsOrOptions
        );
    } while (promiseResolver.hasUnresoveldPromises());

    return result;
}

/**
 * Helper class that can wrap an object and remember methods that were called on it and resolve them.
 */
class SyncPromiseResolver<T> {
    public map: {
        target: any,
        //thisArg: any,
        argArray: any[],

        promise: Promise<any> | null,
        resolved: any | null,
    }[] = [];

    private get(target: any, thisArg: any, argArray: any[]) {
        const item = this.map.find(item => item.target === target && /*item.thisArg === thisArg &&*/ JSON.stringify(item.argArray) === JSON.stringify(argArray));
        return item;
    }

    constructor(private readonly input: T) {};

    public async getWrappedObject(): Promise<T> {
        // First resolve all promises
        const unresolvedEntries = this.map.filter(item => item.promise !== null);
        const resolved = await Promise.all(unresolvedEntries.map(item => item.promise));
        unresolvedEntries.forEach((item, index) => {
            item.resolved = resolved[index];
            item.promise = null;
        });

        // Old object to new object
        // Two phases: first register all objects, then replace them
        const visitedObjectsMapping = new Map<object, object>();
        // Return the same thing, but wrap all functions with new Proxy
        const process = (obj: any) => {
            if (visitedObjectsMapping.has(obj)) {
                return obj;
            }
            visitedObjectsMapping.set(obj, null);

            if (typeof obj === "function") {
                return new Proxy(obj, {
                    apply: (target, thisArg, argArray) => {
                        const exitingEntry = this.get(target, thisArg, argArray);
                        if (exitingEntry) {
                            return exitingEntry.resolved;
                        }

                        const result = target.apply(thisArg, argArray);
                        if (result instanceof Promise) {
                            this.map.push({
                                target,
                                //thisArg,
                                argArray,

                                promise: result,
                                resolved: null,
                            });
                        }
                        return result;
                    }
                });
            } else if (typeof obj === "object") {
                if (obj === null || obj === undefined) {
                    return obj;
                } else if (obj instanceof Array) {
                    const newArray = [];
                    visitedObjectsMapping.set(obj, newArray);
                    obj.forEach(item => newArray.push(process(item)));
                    return newArray;
                } else {
                    const newObject = Object.create(obj);
                    visitedObjectsMapping.set(obj, newObject);
                    Object.entries(obj).forEach(([key, value]) => newObject[key] = process(value));
                    return newObject;
                }
            } else {
                return obj;
            }
        }

        // Second phase: replace all objects


        return process(this.input);
    }

    public hasUnresoveldPromises(): boolean {
        return this.map.some(item => item.promise !== null);
    }
}