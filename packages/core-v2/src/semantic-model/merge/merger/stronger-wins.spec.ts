import { SemanticModelClass } from "../../concepts/index.ts";
import { StrongerWinsSemanticEntityIdMerger } from "./stronger-wins.ts";

test("merge two classes", () => {
  const cName: SemanticModelClass = {
    id: "1",
    iri: ":1",
    type: ["class"],
    name: {
      cs: "name",
    },
    description: {},
  };

  const cDesc: SemanticModelClass = {
    id: "1",
    iri: ":1",
    type: ["class"],
    name: {},
    description: {
      en: "description",
    },
  };

  const cNameDesc: SemanticModelClass = {
    id: "1",
    iri: ":1",
    type: ["class"],
    name: {
      cs: "xxx",
    },
    description: {
      en: "yyy",
    },
  };

  const merger = new StrongerWinsSemanticEntityIdMerger();

  expect(merger.mergeClasses([cName, cDesc])).toStrictEqual(cName);
  expect(merger.mergeClasses([cDesc, cName])).toStrictEqual(cName);
  expect(merger.mergeClasses([cName, cDesc, cName])).toStrictEqual(cName);

  expect(merger.mergeClasses([cName, cDesc, cNameDesc])).toStrictEqual(cNameDesc);
  expect(merger.mergeClasses([cNameDesc, cDesc, cName])).toStrictEqual(cNameDesc);
  expect(merger.mergeClasses([cName, cDesc, cNameDesc, cName])).toStrictEqual(cNameDesc);
});
