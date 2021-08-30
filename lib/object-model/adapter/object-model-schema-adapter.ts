import {
  ObjectModelSchema, ObjectModelClass,
  createObjectModelSchema, isObjectModelClass,
} from "../object-model";
import {ObjectModelClassAdapter} from "./object-model-class-adapter";
import {CoreResourceReader} from "../../core";
import {
  isDataPsmSchema,
  asDataPsmSchema,
  DataPsmSchema,
  isDataPsmClass,
  asDataPsmClass,
} from "../../data-psm/model";

export class ObjectModelSchemaAdapter {

  readonly reader: CoreResourceReader;

  readonly schemas: Record<string, ObjectModelSchema> = {};

  readonly classAdapter: ObjectModelClassAdapter;

  constructor(reader: CoreResourceReader) {
    this.reader = reader;
    this.classAdapter = new ObjectModelClassAdapter(reader);
  }

  async loadSchemaFromDataPsmSchema(iri: string):
    Promise<ObjectModelSchema | undefined> {
    const entity = await this.reader.readResource(iri);
    if (!isDataPsmSchema(entity)) {
      return undefined;
    }
    const psmSchema = asDataPsmSchema(entity);
    const result = createObjectModelSchema();
    this.schemas[psmSchema.iri] = result;
    await this.psmSchemaToSchema(psmSchema, result);
    for (const schema of Object.values(this.schemas)) {
      this.collectClasses(result);
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
      const resource = await this.reader.readResource(iri);
      if (!isDataPsmClass(resource)) {
        continue;
      }
      const dataPsmClass = asDataPsmClass(resource);
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
          if (isObjectModelClass(dataType)) {
            stack.push(dataType as ObjectModelClass);
          }
        }
      }
    }
    objectSchema.classes = Object.values(classes);
  }

}


