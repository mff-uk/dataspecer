import { describe, expect, test } from "vitest";

import { Entities, EntityModel } from "@dataspecer/core-v2"
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

import { firstInMemorySemanticModel } from "./model";

class EntityModelMock implements EntityModel {

  getEntities(): Entities {
    throw new Error("Method not implemented.");
  }

  subscribeToChanges(): () => void {
    throw new Error("Method not implemented.");
  }

  getId(): string {
    throw new Error("Method not implemented.");
  }

  getAlias(): string | null {
    throw new Error("Method not implemented.");
  }

  setAlias(): void {
    throw new Error("Method not implemented.");
  }

}

describe("firstInMemorySemanticModel", () => {

  test("Select first in-memory semantic model.", () => {
    const expected = new InMemorySemanticModel();
    const models = new Map<string, EntityModel>();
    models.set("one", new EntityModelMock());
    models.set("two", expected);
    const actual = firstInMemorySemanticModel(models);
    expect(actual).toBe(expected);
  });

});
