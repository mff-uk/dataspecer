import {createEmptyCoreResource} from "../../../core"
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

  const pimSchema = Operations.asPimCreateSchema(createEmptyCoreResource());
  pimSchema.pimBaseIri = "http://localhost";
  pimSchema.pimHumanLabel = {"en": "Test schema."};
  const pimSchemaChange = await store.applyOperation(pimSchema);
  expect(pimSchemaChange.operation.iri).toBeDefined();
  expect(pimSchemaChange.changed).toEqual([
    "http://localhost/schema/1"
  ]);
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimClass = Operations.asPimCreateClass(createEmptyCoreResource());
  pimClass.pimInterpretation = "http://localhost/cim/TheClass";
  const pimClassChange = await store.applyOperation(pimClass);
  expect(pimClassChange.operation.iri).toBeDefined();
  expect(pimClassChange.changed.sort()).toEqual([
    "http://localhost/schema/1",
    "http://localhost/class/3",
  ].sort());
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimAttribute = Operations.asPimCreateAttribute(
    createEmptyCoreResource());
  pimAttribute.pimDatatype = "xsd:string";
  pimAttribute.pimInterpretation = "http://localhost/cim/TheProperty";
  pimAttribute.pimOwnerClass = "http://localhost/class/3";
  const pimAttributeChange = await store.applyOperation(pimAttribute);
  expect(pimAttributeChange.operation.iri).toBeDefined();
  expect(pimAttributeChange.changed.sort()).toEqual([
    "http://localhost/schema/1",
    "http://localhost/attribute/5",
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
