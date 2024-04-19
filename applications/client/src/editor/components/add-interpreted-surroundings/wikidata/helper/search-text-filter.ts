import { WdEntityDescOnly, WdEntityId, WdEntityIdsList } from "@dataspecer/wikidata-experimental-adapter";

export function entitySearchTextFilter<T extends WdEntityDescOnly>(searchText: string, entities: WdEntityIdsList, entitiesMap: ReadonlyMap<WdEntityId, T>): WdEntityIdsList {
    if (searchText === '') return entities;
      else {
        return entities.filter((id) => {
          const entity = entitiesMap.get(id) as WdEntityDescOnly;
          return entity.labels['en'].toLowerCase().includes(searchText);
        });
      }
}