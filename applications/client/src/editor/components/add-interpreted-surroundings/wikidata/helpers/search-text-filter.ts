import {
    WdEntityDescOnly,
    WdEntityId,
    WdEntityIdsList,
} from "@dataspecer/wikidata-experimental-adapter";

export function entitySearchTextFilterWithMap<T extends WdEntityDescOnly>(
    searchText: string | undefined,
    entitiesIds: WdEntityIdsList,
    entitiesMap: ReadonlyMap<WdEntityId, T>,
): WdEntityIdsList {
    if (searchText === undefined || searchText === "") return entitiesIds;
    else {
        return entitiesIds.filter((id) => {
            const entity = entitiesMap.get(id) as WdEntityDescOnly;
            const inLabel = entity.labels["en"]?.toLowerCase().includes(searchText) ?? false;
            const inDescription = entity.descriptions["en"]?.toLowerCase().includes(searchText) ?? false;
            return inLabel || inDescription;
        });
    }
}

export function entitySearchTextFilter<T extends WdEntityDescOnly>(
    searchText: string | undefined,
    entities: T[],
): T[] {
    if (searchText === undefined || searchText === "") return entities;
    else {
        return entities.filter((entity) => {
            return entity.labels["en"].toLowerCase().includes(searchText);
        });
    }
}
