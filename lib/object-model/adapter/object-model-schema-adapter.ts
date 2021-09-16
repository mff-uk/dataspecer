import {ObjectModelSchema, ObjectModelClass} from "../object-model";
import {ObjectModelClassAdapter} from "./object-model-class-adapter";
import {CoreResourceReader} from "../../core";
import {DataPsmClass, DataPsmSchema} from "../../data-psm/model";

export class ObjectModelSchemaAdapter {

  readonly reader: CoreResourceReader;

  readonly schemas: Record<string, ObjectModelSchema> = {};

  readonly classAdapter: ObjectModelClassAdapter;

  constructor(reader: CoreResourceReader) {
    this.reader = reader;
    this.classAdapter = new ObjectModelClassAdapter(reader);
  }

  async loadSchemaFromDataPsmSchema(iri: string):
    Promise<ObjectModelSchema | null> {
    const psmSchema = await this.reader.readResource(iri);
    if (!DataPsmSchema.is(psmSchema)) {
      return null;
    }
    const result = new ObjectModelSchema();
    this.schemas[psmSchema.iri] = result;
    await this.psmSchemaToSchema(psmSchema, result);
    for (const schema of Object.values(this.schemas)) {
      this.collectClasses(schema);
    }
    return result;
  }

  protected async psmSchemaToSchema(
    dataPsmSchema: DataPsmSchema, objectSchema: ObjectModelSchema,
  ): Promise<void> {
    objectSchema.psmIri = dataPsmSchema.iri;
    objectSchema.technicalLabel = dataPsmSchema.dataPsmTechnicalLabel;
    objectSchema.humanLabel = dataPsmSchema.dataPsmHumanLabel;
    objectSchema.humanDescription = dataPsmSchema.dataPsmHumanDescription;
    for (const iri of dataPsmSchema.dataPsmRoots) {
      const dataPsmClass = await this.reader.readResource(iri);
      if (!DataPsmClass.is(dataPsmClass)) {
        continue;
      }
      const objectModelClass =
        await this.classAdapter.loadClassFromPsmClass(dataPsmClass);
      objectSchema.roots.push(objectModelClass);
    }
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
            stack.push(dataType as ObjectModelClass);
          }
        }
      }
    }
    objectSchema.classes = Object.values(classes);
  }

}
