import * as Operations from "../operation";
import { MemoryStore } from "../../core";
import { baseDataPsmExecutors } from "../executor";
import * as PSM from "../data-psm-vocabulary";

test("Create data PSM schema with class and attribute.", async () => {
  let counter = 0;
  const store = MemoryStore.create(
    "http://localhost",
    baseDataPsmExecutors,
    (type) => `http://localhost/${type}/${++counter}`
  );

  const dataPsmSchema = new Operations.DataPsmCreateSchema();
  dataPsmSchema.dataPsmHumanLabel = { en: "Test schema." };
  const dataPsmSchemaChange = await store.applyOperation(dataPsmSchema);
  expect(dataPsmSchemaChange.operation.iri).toBeDefined();
  expect(dataPsmSchemaChange.created).toEqual(["http://localhost/schema/1"]);
  expect(dataPsmSchemaChange.changed).toEqual([]);
  expect(dataPsmSchemaChange.deleted).toEqual([]);

  const dataPsmClass = new Operations.DataPsmCreateClass();
  dataPsmClass.dataPsmInterpretation = "http://localhost/cim/TheClass";
  const dataPsmClassChange = await store.applyOperation(dataPsmClass);
  expect(dataPsmClassChange.operation.iri).toBeDefined();
  expect(dataPsmClassChange.created).toEqual(["http://localhost/class/3"]);
  expect(dataPsmClassChange.changed).toEqual(["http://localhost/schema/1"]);
  expect(dataPsmSchemaChange.deleted).toEqual([]);

  const dataPsmAttribute = new Operations.DataPsmCreateAttribute();
  dataPsmAttribute.dataPsmDatatype = "xsd:string";
  dataPsmAttribute.dataPsmInterpretation = "http://localhost/cim/TheProperty";
  dataPsmAttribute.dataPsmOwner = "http://localhost/class/3";
  const dataPsmAttributeChange = await store.applyOperation(dataPsmAttribute);
  expect(dataPsmAttributeChange.operation.iri).toBeDefined();
  expect(dataPsmAttributeChange.created).toEqual([
    "http://localhost/attribute/5",
  ]);
  expect(dataPsmAttributeChange.changed.sort()).toEqual(
    ["http://localhost/schema/1", "http://localhost/class/3"].sort()
  );
  expect(dataPsmSchemaChange.deleted).toEqual([]);

  //

  expect((await store.listResources()).sort()).toEqual(
    [
      "http://localhost/schema/1",
      "http://localhost/class/3",
      "http://localhost/attribute/5",
    ].sort()
  );

  expect(await store.readResource("http://localhost/schema/1")).toEqual({
    iri: "http://localhost/schema/1",
    types: [PSM.SCHEMA],
    dataPsmHumanLabel: dataPsmSchema.dataPsmHumanLabel,
    dataPsmHumanDescription: dataPsmSchema.dataPsmHumanDescription,
    dataPsmTechnicalLabel: null,
    dataPsmParts: ["http://localhost/class/3", "http://localhost/attribute/5"],
    dataPsmRoots: [],
  });

  expect(await store.readResource("http://localhost/class/3")).toEqual({
    iri: "http://localhost/class/3",
    types: [PSM.CLASS],
    dataPsmInterpretation: dataPsmClass.dataPsmInterpretation,
    dataPsmTechnicalLabel: dataPsmClass.dataPsmTechnicalLabel,
    dataPsmHumanLabel: dataPsmClass.dataPsmHumanLabel,
    dataPsmHumanDescription: dataPsmClass.dataPsmHumanDescription,
    dataPsmExtends: dataPsmClass.dataPsmExtends,
    dataPsmParts: ["http://localhost/attribute/5"],
  });

  expect(await store.readResource("http://localhost/attribute/5")).toEqual({
    iri: "http://localhost/attribute/5",
    types: [PSM.ATTRIBUTE],
    dataPsmInterpretation: dataPsmAttribute.dataPsmInterpretation,
    dataPsmTechnicalLabel: dataPsmAttribute.dataPsmTechnicalLabel,
    dataPsmHumanLabel: dataPsmAttribute.dataPsmHumanLabel,
    dataPsmHumanDescription: dataPsmAttribute.dataPsmHumanDescription,
    dataPsmDatatype: dataPsmAttribute.dataPsmDatatype,
  });
});

test("Create and delete data PSM class", async () => {
  let counter = 0;
  const store = MemoryStore.create(
    "http://localhost",
    baseDataPsmExecutors,
    (type) => `http://localhost/${type}/${++counter}`
  );

  const pimSchema = new Operations.DataPsmCreateSchema();
  const pimSchemaChange = await store.applyOperation(pimSchema);
  expect(pimSchemaChange.operation.iri).toBeDefined();
  expect(pimSchemaChange.created).toEqual(["http://localhost/schema/1"]);
  expect(pimSchemaChange.changed).toEqual([]);
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimCreate = new Operations.DataPsmCreateClass();
  const pimCreateChange = await store.applyOperation(pimCreate);
  expect(pimCreateChange.operation.iri).toBeDefined();
  expect(pimCreateChange.created).toEqual(["http://localhost/class/3"]);
  expect(pimCreateChange.changed).toEqual(["http://localhost/schema/1"]);
  expect(pimSchemaChange.deleted).toEqual([]);

  const pimDelete = new Operations.DataPsmDeleteClass();
  pimDelete.dataPsmClass = "http://localhost/class/3";
  const pimDeleteChange = await store.applyOperation(pimDelete);
  expect(pimDeleteChange.operation.iri).toBeDefined();
  expect(pimDeleteChange.changed).toEqual(["http://localhost/schema/1"]);
  expect(pimDeleteChange.deleted).toEqual(["http://localhost/class/3"]);

  expect((await store.listResources()).sort()).toEqual(
    ["http://localhost/schema/1"].sort()
  );
});
