import { WdEntityDescOnly, WdEntityId } from "../../../wikidata-entities/wd-entity.ts";

export function buildEntityMap<T extends WdEntityDescOnly>(
    entities: T[],
): ReadonlyMap<WdEntityId, T> {
    const newMap = new Map<WdEntityId, T>();
    entities.forEach((entity) => {
        if (!newMap.has(entity.id)) {
            newMap.set(entity.id, entity);
        }
    });
    return newMap;
}
