import { NamedThing } from "@dataspecer/core-v2/semantic-model/concepts";

export function getSearchRelevance(query: RegExp, entity: NamedThing): number | false {
  let result: number | false = false;

  for (const translation of Object.values(entity?.name ?? {})) {
    if (query.test(translation) && (!result || translation.length < result)) {
      result = translation.length;
    }
  }

  return result;
}
