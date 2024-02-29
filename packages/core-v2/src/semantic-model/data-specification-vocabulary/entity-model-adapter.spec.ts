import { ApplicationProfile } from "./model";
import { entitiesToApplicationProfile } from "./entity-model-adapter";

test("Class with a profile", async () => {
  const entities = [{
    "id": "dsvh2gd3elelt6yjjcm",
    "iri": "https://my-model.org/dull-service",
    "type": ["class"],
    "name": { "en": "Dull Service" },
    "description": {}
  }, {
    "id": "tnpsra4dwylt6yjvsz",
    "usageOf": "dsvh2gd3elelt6yjjcm",
    "type": ["class-usage"],
    "name": { "cs": "Tohle je profil!" },
    "description": {},
    "usageNote": {}
  }] as any;
  const actual = entitiesToApplicationProfile(entities, null);
  const expected : ApplicationProfile = {
    "iri": "http://example.com/profile",
    "previousVersion": null,
    "reUsedSpecification": [],
    "controlledVocabulary": [],
    "dataStructure": [],
    "artefact": [],
    "conceptualModel": [{
      "iri": "http://example.com/model",
      "classes": [{
        "iri": "http://example.com/tnpsra4dwylt6yjvsz",
        "profileOf": null,
        "specializes": null,
        "profiledClass": {
          "iri": "https://my-model.org/dull-service"
        },
      }],
    }],
  };
  expect(actual).toEqual(expected);
});
