import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

export const johnsIri = "https://concepts.com/john";
export const janeIri = "https://concepts.com/jane";
export const johnsName = { en: "john" };
export const johnsDescription = { en: "that's john" };

export const johnClass: SemanticModelClass = {
    name: johnsName,
    id: "123abc123",
    type: ["class"],
    description: johnsDescription,
    iri: johnsIri,
};

export const lovesIri = "https://bob.com/relationships#loves";
export const lovesName = { en: "loves" };
export const lovesDescription = { en: "the feeling people have sometimes" };
export const lovesRelationship: SemanticModelRelationship = {
    id: "123abc123",
    type: ["relationship"],
    name: {},
    description: {},
    iri: null,
    ends: [
        { concept: johnsIri, description: {}, name: {}, iri: null },
        {
            concept: janeIri,
            description: lovesDescription,
            name: lovesName,
            iri: lovesIri,
        },
    ],
};

export const lovesRelationshipWithBothIris: SemanticModelRelationship = {
    id: "123abc123",
    type: ["relationship"],
    name: {},
    description: {},
    iri: null,
    ends: [
        { concept: "https://bob.com/jane", description: {}, name: {}, iri: "https://bob.com/relationships#loves2" },
        {
            concept: "https://bob.com/bob",
            description: { en: "the feeling people have sometimes" },
            name: { en: "loves" },
            iri: "https://bob.com/relationships#loves",
        },
    ],
};

export const janesAgeIri = "https://bob.com/attributes#janes-age";
export const janesAgeName = { en: "jane's age" };
export const janesAgeDescription = { en: "the age of jane in years" };
export const janesAgeAttribute: SemanticModelRelationship = {
    id: "123abc123",
    type: ["relationship"],
    name: {},
    description: {},
    iri: null,
    ends: [
        { concept: janeIri, description: {}, name: {}, iri: null },
        {
            concept: "http://www.w3.org/2001/XMLSchema#integer",
            description: janesAgeDescription,
            name: janesAgeName,
            iri: janesAgeIri,
        },
    ],
};

export const localModelBaseIri = "https://cool-model.com/concepts#";
export const localModelId = "a-model-123";
export const localModelAlias = "very cool model";

export const localModelWithBaseIri = new InMemorySemanticModel().deserializeModel({
    baseIri: localModelBaseIri,
    modelId: localModelId,
    modelAlias: localModelAlias,
    entities: [],
});

export const localModelWithOutBaseIri = new InMemorySemanticModel().deserializeModel({
    baseIri: "",
    modelId: localModelId,
    modelAlias: "",
    entities: [],
});
