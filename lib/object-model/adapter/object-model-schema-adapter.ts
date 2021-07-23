import {CoreResourceMap, PsmSchema,PsmClass} from "../../core/model";
import {ObjectModelSchema, ObjectModelClass} from "../object-model";
import {ObjectModelClassAdapter} from "./object-model-class-adapter";

export class ObjectModelSchemaAdapter {

  readonly entities: CoreResourceMap;

  readonly schemas: Record<string, ObjectModelSchema> = {};

  readonly classAdapter: ObjectModelClassAdapter;

  constructor(entities: CoreResourceMap) {
    this.entities = entities;
    this.classAdapter = new ObjectModelClassAdapter(entities);
  }

  loadSchemaFromPsmSchema(iri: string): ObjectModelSchema | undefined {
    const entity = this.entities[iri];
    if (!PsmSchema.is(entity)) {
      return undefined;
    }
    const psmSchema = PsmSchema.as(entity);
    const result = new ObjectModelSchema();
    this.schemas[psmSchema.iri] = result;
    this.psmSchemaToSchema(psmSchema, result);
    this.collectClasses(result);
    return result;
  }

  protected psmSchemaToSchema(
    psmSchema: PsmSchema, objectSchema: ObjectModelSchema
  ):void {
    objectSchema.psmIri = psmSchema.iri;
    objectSchema.humanLabel = psmSchema.psmHumanLabel;
    objectSchema.humanDescription = psmSchema.psmHumanDescription;
    objectSchema.roots = psmSchema.psmRoots
      .map(iri => this.entities[iri])
      .filter(entity => PsmClass.is(entity))
      .map(entity => PsmClass.as(entity))
      .map(entity => this.classAdapter.loadClassFromPsmClass(entity));
  }

  protected collectClasses(objectSchema: ObjectModelSchema): void {
    const classes: Record<string, ObjectModelClass> = {};
    const stack = [...objectSchema.roots];
    while (stack.length > 0) {
      const next = stack.pop();
      if (classes[next.psmIri] !== undefined) {
        continue;
      }
      classes[next.psmIri] = next;
      // Add all classes.
      stack.push(...next.extends);
      for (const property of next.properties) {
        for (const dataType of property.dataTypes) {
          if (ObjectModelClass.is(dataType)) {
            stack.push(ObjectModelClass.as(dataType));
          }
        }
      }
    }
    objectSchema.classes = Object.values(classes);
  }

}


