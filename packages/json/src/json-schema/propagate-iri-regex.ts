import { ConceptualModel } from "@dataspecer/core";
import { clone } from "@dataspecer/core/core/index";
import { StructureModel } from "@dataspecer/core/structure-model/model/structure-model";
import { StructureModelClass } from "@dataspecer/core/structure-model/model/structure-model-class";

/**
 * Add regex from {@link ConceptualModel} and examples for classes with iris.
 */
export function propagateIriRegex(
  conceptual: ConceptualModel,
  structure: StructureModel
): StructureModel {
  const result = clone(structure) as StructureModel;
  for (const root of result.roots) {
    for (const cls of root.classes) {
      visitClass(
        cls,
        [],
        result.jsonLdDefinedPrefixes,
        conceptual
      );
    }
  }
  return result;
}

function visitClass(
  cls: StructureModelClass,
  visitedClasses: StructureModelClass[],
  parentPrefixMap: {
    [prefix: string]: string;
  },
  conceptual: ConceptualModel,
) {
  if (visitedClasses.includes(cls)) {
    return;
  }
  visitedClasses.push(cls);
  const prefixMap = Object.entries({
    ...parentPrefixMap,
    ...cls.jsonLdDefinedPrefixes
  });
  prefixMap.sort(
    (a, b) => b[1].length - a[1].length
  );
  const option = cls.jsonSchemaPrefixesInIriRegex.usePrefixes

  const conceptualClass = conceptual.classes[cls.pimIri];
  if (conceptualClass === null || conceptualClass === undefined) {
    return;
  }

  if (conceptualClass.regex) {
    if (option === "NEVER") {
      cls.regex = conceptualClass.regex;
    } else if (option === "ALWAYS") {
      let regex = conceptualClass.regex;
      for (const [prefix, prefixIri] of prefixMap) {
        const iri = prefixIri.replaceAll(/\./g, "\\.");
        regex = regex.replaceAll(iri, prefix + ":");
      }
      cls.regex = regex;
    } else if (option === "OPTIONAL") {
      let regex = conceptualClass.regex;
      for (const [prefix, prefixIri] of prefixMap) {
        const iri = prefixIri.replaceAll(/\./g, "\\.");
        regex = regex.replaceAll(iri, `(${prefix + ":"}|${iri})`);
      }
      cls.regex = regex;
    } else {
      option satisfies never;
    }
    console.log(cls.regex);
  }


  for (const property of cls.properties) {
    for (const dataType of property.dataTypes) {
      if (dataType.isAssociation()) {
        visitClass(
          dataType.dataType,
          visitedClasses,
          Object.fromEntries(prefixMap),
          conceptual
        );
      }
    }
  }
}