import {
  Cardinality,
  ClassProfile,
  DSV_REUSE_LABEL,
  DSV_REUSE_USAGE_NOTE,
  DsvModel,
  isDatatypePropertyProfile,
  isObjectPropertyProfile,
  PropertyProfile,
  PropertyValueReuse,
} from "@dataspecer/core-v2/semantic-model/data-specification-vocabulary";
import {
  OwlClass,
  OwlOntology,
  OwlProperty,
} from "../lightweight-owl/index.ts";
import {
  StructureClass,
  StructureModel,
  StructureProperty,
  StructurePropertyType,
} from "./structure-model.ts";
import { isComplexType, isPrimitiveType } from "@dataspecer/core-v2/semantic-model/datatypes";

/**
 * Use {@link Type}.iri as an identifier.
 */
interface Resolvable<Type extends { iri: string }> {

  /**
   * Dependencies that must be resolved before this.
   */
  dependencies: string[];

  /**
   * If true the value has been fully resolved.
   */
  isResolved: boolean;

  value: Type;

}

type ResolvableClass = Resolvable<StructureClass>;

type ResolvableProperty = Resolvable<StructureProperty>;

export function createStructureModel(
  owlOntologies: OwlOntology[],
  dsvModels: DsvModel[],
  classFilter: (identifier: string) => boolean,
): StructureModel {

  const classesMap: { [iri: string]: ResolvableClass } = {};

  const propertyMap: { [iri: string]: ResolvableProperty } = {};

  // Start with OWL.
  for (const owl of owlOntologies) {
    owl.classes.forEach(item => {
      const next = owlClassToResolvableClass(item);
      const prev = classesMap[next.value.iri];
      classesMap[next.value.iri] = prev === undefined ?
        next : mergeResolvableClassToExisting(prev, next);
    });
    owl.properties.forEach(item => {
      const next = owlPropertyToResolvableProperty(item);
      const prev = propertyMap[next.value.iri];
      propertyMap[next.value.iri] = prev === undefined ?
        next :
        mergeResolvablePropertyToExisting(prev, next);
    });
  }

  // Continue with DSV.
  for (const dsv of dsvModels) {
    dsv.profiles.forEach(item => {
      const next = dsvClassProfileToResolvableClass(item);
      const prev = classesMap[next.value.iri];
      classesMap[next.value.iri] = prev === undefined ?
        next : mergeResolvableClassToExisting(prev, next);
      // In DSV the properties are stored under profiles.
      item.properties.forEach(property => {
        const nextProperty = dsvPropertyProfileToResolvableProperty(item, property);
        const prevProperty = propertyMap[nextProperty.value.iri];
        propertyMap[nextProperty.value.iri] = prevProperty === undefined ?
          nextProperty :
          mergeResolvablePropertyToExisting(prevProperty, nextProperty);
      });
    });
  }

  // Now we go and try to resolve what we can.
  while (true) {
    const hasClassesChanged = executeResolveIteration(
      classesMap, resolveResolvableClass);
    const hasPropertiesChanged = executeResolveIteration(
      propertyMap, resolveResolvableProperty);
    // Terminate when there is no change.
    if (!hasClassesChanged && !hasPropertiesChanged) {
      break;
    }
  }

  // Select the result.

  const classes = Object.values(classesMap)
    .filter(item => classFilter(item.value.iri))
    .map(item => item.value);

  // Add properties to classes.
  classes.forEach(classItem => {
    classItem.properties = Object.values(propertyMap)
      .filter(item => item.value.domain == classItem.iri)
      .map(item => item.value);
  });

  return {
    classes,
  };
}

function owlClassToResolvableClass(
  value: OwlClass,
): ResolvableClass {
  return {
    dependencies: [],
    isResolved: true,
    value: {
      iri: value.iri,
      name: value.name,
      nameSource: null,
      usageNote: null,
      usageNoteSource: null,
      specializationOf: [],
      // StructureClass
      types: [value.iri],
      properties: [],
    },
  };
}

function mergeResolvableClassToExisting(
  prev: ResolvableClass, next: ResolvableClass,
): ResolvableClass {
  const prevValue = prev.value;
  const nextValue = next.value;
  return {
    dependencies: [...prev.dependencies, ...next.dependencies],
    isResolved: prev.isResolved && next.isResolved,
    value: {
      iri: prevValue.iri,
      name: prevValue.name ?? nextValue.name,
      nameSource: prevValue.nameSource ?? nextValue.nameSource,
      usageNote: prevValue.usageNote ?? nextValue.usageNote,
      usageNoteSource: prevValue.usageNoteSource ?? nextValue.usageNoteSource,
      specializationOf: [
        ...prevValue.specializationOf, ...nextValue.specializationOf],
      // StructureClass
      types: mergeArrayAsUniq(prevValue.types, nextValue.types),
      properties: [...prevValue.properties, ...nextValue.properties],
    },
  };
}

function mergeArrayAsUniq<T>(left: T[], right: T[]): T[] {
  return Array.from(new Set([...left, ...right]));
}

function owlPropertyToResolvableProperty(
  value: OwlProperty,
): ResolvableProperty {
  let type: StructurePropertyType = StructurePropertyType.Undecidable;
  const isPrimitive = isPrimitiveType(value.range);
  const isComplex = isComplexType(value.range);
  if (isPrimitive && !isComplex) {
    type = StructurePropertyType.PrimitiveProperty;
  } else if (!isPrimitive && isComplex) {
    type = StructurePropertyType.ComplexProperty;
  }
  return {
    dependencies: [],
    isResolved: true,
    value: {
      iri: value.iri,
      name: value.name,
      nameSource: null,
      usageNote: null,
      usageNoteSource: null,
      specializationOf: value.subPropertyOf,
      // StructureProperty
      type,
      predicates: [value.iri],
      domain: value.domain,
      range: [value.range],
      rangeCardinality: {
        min: null,
        max: null,
      },
    },
  };
}

function mergeResolvablePropertyToExisting(
  prev: ResolvableProperty, next: ResolvableProperty,
): ResolvableProperty {
  const prevValue = prev.value;
  const nextValue = next.value;
  return {
    dependencies: [...prev.dependencies, ...next.dependencies],
    isResolved: prev.isResolved && next.isResolved,
    value: {
      iri: prevValue.iri,
      name: prevValue.name ?? nextValue.name,
      nameSource: prevValue.nameSource ?? nextValue.nameSource,
      usageNote: prevValue.usageNote ?? nextValue.usageNote,
      usageNoteSource: prevValue.usageNoteSource ?? nextValue.usageNoteSource,
      specializationOf: [
        ...prevValue.specializationOf, ...nextValue.specializationOf],
      // StructureProperty
      type: prevValue.type === nextValue.type
        ? prevValue.type : StructurePropertyType.Undecidable,
      predicates: [...prevValue.predicates, ...nextValue.predicates],
      domain: prevValue.domain ?? nextValue.domain,
      range: prevValue.range ?? nextValue.range,
      rangeCardinality: mergeCardinalities(
        prevValue.rangeCardinality, nextValue.rangeCardinality),
    },
  };
}

function mergeCardinalities(
  left: { min: number | null, max: number | null },
  right: { min: number | null, max: number | null },
): { min: number | null, max: number | null } {
  let min: number | null = null;
  let max: number | null = null;

  if (left.min !== null && right.min !== null) {
    min = Math.max(left.min, right.min);
  } else if (left.min !== null) {
    min = left.min;
  } else if (right.min !== null) {
    min = right.min;
  }

  if (left.max !== null && right.max !== null) {
    max = Math.min(left.max, right.max);
  } else if (left.max !== null) {
    max = left.max;
  } else if (right.max !== null) {
    max = right.max;
  }

  return { min, max };
}

function dsvClassProfileToResolvableClass(
  value: ClassProfile,
): ResolvableClass {
  return {
    dependencies: [...value.profileOfIri, ...value.profiledClassIri],
    isResolved: false,
    value: {
      iri: value.iri,
      name: value.prefLabel,
      nameSource: findSource(DSV_REUSE_LABEL, value),
      usageNote: value.usageNote,
      usageNoteSource: findSource(DSV_REUSE_USAGE_NOTE, value),
      specializationOf: value.specializationOfIri,
      // StructureClass
      types: [],
      properties: [],
    },
  }
}

function findSource(
  property: string,
  profile: { reusesPropertyValue: PropertyValueReuse[] },
): string | null {
  for (const item of profile.reusesPropertyValue) {
    if (item.reusedPropertyIri === property) {
      return item.propertyReusedFromResourceIri;
    }
  }
  return null;
}

function dsvPropertyProfileToResolvableProperty(
  owner: ClassProfile,
  value: PropertyProfile,
): ResolvableProperty {
  let type: StructurePropertyType = StructurePropertyType.Undecidable;
  let range: string[] = [];
  if (isObjectPropertyProfile(value)) {
    type = StructurePropertyType.ComplexProperty;
    range = value.rangeClassIri;
  } else if (isDatatypePropertyProfile(value)) {
    type = StructurePropertyType.PrimitiveProperty;
    range = value.rangeDataTypeIri;
  }
  return {
    dependencies: [...value.profileOfIri, ...value.profiledPropertyIri],
    isResolved: false,
    value: {
      iri: value.iri,
      name: value.prefLabel,
      nameSource: findSource(DSV_REUSE_LABEL, value),
      usageNote: value.usageNote,
      usageNoteSource: findSource(DSV_REUSE_USAGE_NOTE, value),
      specializationOf: value.specializationOfIri,
      // StructureProperty
      type,
      predicates: [],
      domain: owner.iri,
      range,
      rangeCardinality: dsvCardinality(value.cardinality),
    },
  }
}

function dsvCardinality(value: Cardinality | null): {
  min: number | null;
  max: number | null;
} {
  if (value === null) {
    return { min: null, max: null };
  }
  switch (value) {
    case Cardinality.ZeroToZero:
      return { min: 0, max: 0 };
    case Cardinality.ZeroToOne:
      return { min: 0, max: 1 };
    case Cardinality.ZeroToMany:
      return { min: 0, max: null };
    case Cardinality.OneToZero:
      return { min: 1, max: 0 };
    case Cardinality.OneToOne:
      return { min: 1, max: 1 };
    case Cardinality.OneToMany:
      return { min: 1, max: null };
    case Cardinality.ManyToZero:
      return { min: null, max: 0 };
    case Cardinality.ManyToOne:
      return { min: null, max: 1 };
    case Cardinality.ManyToMany:
      return { min: null, max: null };
  }
}

/**
 * Run resolution iteration to resolve items with resolved dependencies.
 */
function executeResolveIteration<Type extends {
  isResolved: boolean,
  dependencies: string[],
}>(
  itemMap: { [iri: string]: Type },
  resolve: (toResolve: Type, dependencies: Type[]) => void,
): boolean {
  let hasChanged = false;
  for (const item of Object.values(itemMap)) {
    if (item.isResolved) {
      continue;
    }
    const dependencies = item.dependencies
      .map(identifier => itemMap[identifier])
      .filter(item => item !== undefined);
    const allDependenciesResolved = dependencies
      .every(item => item.isResolved);
    if (!allDependenciesResolved) {
      continue;
    }
    resolve(item, dependencies);
    hasChanged = true;
  }
  return hasChanged;
}

function resolveResolvableClass(
  toResolve: ResolvableClass,
  dependencies: ResolvableClass[],
): void {
  toResolve.isResolved = true;
  const value = toResolve.value;
  //
  for (const { value: next } of dependencies) {
    if (value.nameSource === next.iri) {
      value.name = next.name;
    }
    if (value.usageNoteSource === next.iri) {
      value.usageNote = next.usageNote;
    }
    //
    value.types = mergeArrayAsUniq(value.types, next.types);
  }
}

function resolveResolvableProperty(
  toResolve: ResolvableProperty,
  dependencies: ResolvableProperty[],
): void {
  toResolve.isResolved = true;
  const value = toResolve.value;
  //
  for (const { value: next } of dependencies) {
    if (value.nameSource === next.iri) {
      value.name = next.name;
    }
    if (value.usageNoteSource === next.iri) {
      value.usageNote = next.usageNote;
    }
    //
    value.predicates = mergeArrayAsUniq(value.predicates, next.predicates);
    value.rangeCardinality = mergeCardinalities(
      value.rangeCardinality, next.rangeCardinality);
  }
}
