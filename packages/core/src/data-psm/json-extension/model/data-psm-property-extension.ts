import { DataPsmResource } from "../../model/index.ts";
import { JSON_EXTENSION } from "../vocabulary.ts";

class JsonPropertyExtension {
  useKeyValueForLangString: boolean = false;
}

export class DataPsmJsonPropertyExtension extends DataPsmResource {
  declare extensions?: {
    string: object;
    [JSON_EXTENSION]?: Partial<JsonPropertyExtension>
  }

  static getExtensionData(property: DataPsmJsonPropertyExtension): JsonPropertyExtension {
    const data = new JsonPropertyExtension();
    Object.assign(data, property?.extensions?.[JSON_EXTENSION]);
    return data;
  }
}
