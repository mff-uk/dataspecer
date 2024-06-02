import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import {
    getDescriptionLanguageString,
    getFallbackDisplayName,
    getModelDisplayName,
    getNameLanguageString,
} from "../app/core-v2/util/name-utils";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";

// --- names --- --- ---

test("returns name language string for class", () => {
    const johnsName = { en: "john", cs: "honza" };
    const john: SemanticModelClass = {
        name: johnsName,
        id: "123abc123",
        type: ["class"],
        description: {},
        iri: null,
    };
    const nls = getNameLanguageString(john);
    expect(nls).toBe(johnsName);
});

test("returns name language string for relationship", () => {
    const lovesName = { en: "loves", cs: "miluje" };
    const loves: SemanticModelRelationship = {
        id: "123abc123",
        type: ["relationship"],
        name: {},
        description: {},
        iri: null,
        ends: [
            { concept: "https://bob.com/jane", description: {}, name: {}, iri: null },
            {
                concept: "https://bob.com/bob",
                description: {},
                name: lovesName,
                iri: "https://bob.com/relationships#loves",
            },
        ],
    };
    const nls = getNameLanguageString(loves);
    expect(nls).toBe(lovesName);
});

// --- descriptions --- --- ---

test("returns description language string for class", () => {
    const johnsDescription = { en: "he's a john", cs: "je to honza" };
    const john: SemanticModelClass = {
        name: {},
        id: "123abc123",
        type: ["class"],
        description: johnsDescription,
        iri: null,
    };
    const dls = getDescriptionLanguageString(john);
    expect(dls).toBe(johnsDescription);
});

test("returns description language string for relationship", () => {
    const lovesDescription = { en: "one loves another", cs: "jeden miluje druhého" };
    const loves: SemanticModelRelationship = {
        id: "123abc123",
        type: ["relationship"],
        name: {},
        description: {},
        iri: null,
        ends: [
            { concept: "https://bob.com/jane", description: {}, name: {}, iri: null },
            {
                concept: "https://bob.com/bob",
                description: lovesDescription,
                name: {},
                iri: "https://bob.com/relationships#loves",
            },
        ],
    };
    const dls = getDescriptionLanguageString(loves);
    expect(dls).toBe(lovesDescription);
});

// fallback names

test("missing name falls back to iri", () => {
    const johnsIri = "https://custom.iris.com/john";
    const namelessJohn: SemanticModelClass = {
        name: {},
        id: "123abc123",
        type: ["class"],
        description: {},
        iri: johnsIri,
    };
    const fdn = getFallbackDisplayName(namelessJohn);
    expect(fdn).toBe(johnsIri);
});

test("missing name falls back to iri, if not iri then id", () => {
    const johnsId = "123john123";
    const namelessJohn: SemanticModelClass = {
        name: {},
        id: johnsId,
        type: ["class"],
        description: {},
        iri: null,
    };
    const fdn = getFallbackDisplayName(namelessJohn);
    expect(fdn).toBe(johnsId);
});

// model names

test("model name", () => {
    const modelId = "123model123";
    const modelAlias = "cool model";
    const modelBaseIri = "https://cool-model.com/entities#";

    const model = new InMemorySemanticModel().deserializeModel({
        baseIri: modelBaseIri,
        modelId: modelId,
        modelAlias: modelAlias,
        entities: [],
    });

    const ma = getModelDisplayName(model);
    expect(ma).toBe(`${modelAlias} (${modelId})`);
});
