import {createCoreResource} from "../../../core";
import {PimMemoryStore} from "./pim-memory-store";
import * as Operations from "../../operation";

class PredictableStore extends PimMemoryStore {

  protected counter = 0;

  protected createUniqueIdentifier(): string {
    return "" + ++this.counter;
  }

}

test("Create PIM schema with class and attribute.", async () => {
  const store = new PredictableStore();

  const pimSchema = Operations.asPimCreateSchema(createCoreResource());
  pimSchema.pimBaseIri = "http://localhost";
  pimSchema.pimHumanLabel = {"en": "Test schema."};
  const pimSchemaChange = await store.applyOperation(pimSchema);
  expect(pimSchemaChange.operation.iri).toBeDefined();
  expect(pimSchemaChange.created).toEqual([
    "http://localhost/schema/1",
  ]);
  expect(pimSchemaChange.changed).toEqual([]);
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimClass = Operations.asPimCreateClass(createCoreResource());
  pimClass.pimInterpretation = "http://localhost/cim/TheClass";
  const pimClassChange = await store.applyOperation(pimClass);
  expect(pimClassChange.operation.iri).toBeDefined();
  expect(pimClassChange.created).toEqual([
    "http://localhost/class/3",
  ]);
  expect(pimClassChange.changed.sort()).toEqual([
    "http://localhost/schema/1",
  ].sort());
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimAttribute = Operations.asPimCreateAttribute(
    createCoreResource());
  pimAttribute.pimDatatype = "xsd:string";
  pimAttribute.pimInterpretation = "http://localhost/cim/TheProperty";
  pimAttribute.pimOwnerClass = "http://localhost/class/3";
  const pimAttributeChange = await store.applyOperation(pimAttribute);
  expect(pimAttributeChange.operation.iri).toBeDefined();
  expect(pimAttributeChange.created).toEqual([
    "http://localhost/attribute/5",
  ]);
  expect(pimAttributeChange.changed.sort()).toEqual([
    "http://localhost/schema/1",
  ].sort());
  expect(pimSchemaChange.deleted).toEqual([]);

  //

  expect((await store.listResources()).sort()).toEqual([
    "http://localhost/schema/1",
    "http://localhost/class/3",
    "http://localhost/attribute/5",
  ].sort());

  expect(await store.readResource("http://localhost/schema/1")).toEqual({
    "iri": "http://localhost/schema/1",
    "types": ["pim-schema"],
    "pimHumanLabel": pimSchema.pimHumanLabel,
    "pimHumanDescription": pimSchema.pimHumanDescription,
    "pimParts": ["http://localhost/class/3", "http://localhost/attribute/5"],
  });

  expect(await store.readResource("http://localhost/class/3")).toEqual({
    "iri": "http://localhost/class/3",
    "types": ["pim-class"],
    "pimInterpretation": pimClass.pimInterpretation,
    "pimTechnicalLabel": pimClass.pimTechnicalLabel,
    "pimHumanLabel": pimClass.pimHumanLabel,
    "pimHumanDescription": pimClass.pimHumanDescription,
    "pimExtends": pimClass.pimExtends,
  });

  expect(await store.readResource("http://localhost/attribute/5")).toEqual({
    "iri": "http://localhost/attribute/5",
    "types": ["pim-attribute"],
    "pimInterpretation": pimAttribute.pimInterpretation,
    "pimTechnicalLabel": pimAttribute.pimTechnicalLabel,
    "pimHumanLabel": pimAttribute.pimHumanLabel,
    "pimHumanDescription": pimAttribute.pimHumanDescription,
    "pimOwnerClass": pimAttribute.pimOwnerClass,
    "pimDatatype": pimAttribute.pimDatatype,
  });

});

test("Create and delete PIM class", async () => {
  const store = new PredictableStore();

  const pimSchema = Operations.asPimCreateSchema(createCoreResource());
  pimSchema.pimBaseIri = "http://localhost";
  const pimSchemaChange = await store.applyOperation(pimSchema);
  expect(pimSchemaChange.operation.iri).toBeDefined();
  expect(pimSchemaChange.created).toEqual([
    "http://localhost/schema/1",
  ]);
  expect(pimSchemaChange.changed).toEqual([]);
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimCreate = Operations.asPimCreateClass(createCoreResource());
  const pimCreateChange = await store.applyOperation(pimCreate);
  expect(pimCreateChange.operation.iri).toBeDefined();
  expect(pimCreateChange.created).toEqual([
    "http://localhost/class/3",
  ]);
  expect(pimCreateChange.changed.sort()).toEqual([
    "http://localhost/schema/1",
  ].sort());
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimDelete = Operations.asPimDeleteClass(createCoreResource());
  pimDelete.pimClass = "http://localhost/class/3";
  const pimDeleteChange = await store.applyOperation(pimDelete);
  expect(pimDeleteChange.operation.iri).toBeDefined();
  expect(pimDeleteChange.changed).toEqual(["http://localhost/schema/1"]);
  expect(pimDeleteChange.deleted).toEqual(["http://localhost/class/3"]);

  expect((await store.listResources()).sort()).toEqual([
    "http://localhost/schema/1",
  ].sort());

});
