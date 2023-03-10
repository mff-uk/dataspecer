import { ConceptualModelProperty } from "./conceptual-model-property";
import { LanguageString } from "../../core";

export class ConceptualModelClass {
  pimIri: string | null = null;

  cimIri: string | null = null;

  humanLabel: LanguageString | null = null;

  humanDescription: LanguageString | null = null;

  isCodelist = false;

  codelistUrl: string[] = [];

  extends: ConceptualModelClass[] = [];

  properties: ConceptualModelProperty[] = [];

  regex: string | null = null;

  example: unknown[] | null = null;

  static getAllExtends(cls: ConceptualModelClass): ConceptualModelClass[] {
    const result = new Set<ConceptualModelClass>();
    const queue = [...cls.extends];
    while (queue.length > 0) {
      const current = queue.pop()!;
      if (!result.has(current)) {
        result.add(current);
        queue.push(...current.extends);
      }
    }
    return [...result];
  }
}
