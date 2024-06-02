import type {
    SemanticModelClass,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { bothEndsHaveAnIri, isAnAttribute, isAnEdge, temporaryDomainRangeHelper } from "~/app/util/relationship-utils";

test("correctly judge if relationship has iris at both ends", () => {
    const lovesName = { en: "loves", cs: "miluje" };

    const lovesWithOneIri: SemanticModelRelationship = {
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

    const lovesWithBothIris: SemanticModelRelationship = {
        id: "123abc123",
        type: ["relationship"],
        name: {},
        description: {},
        iri: null,
        ends: [
            { concept: "https://bob.com/jane", description: {}, name: {}, iri: "https://bob.com/relationships#loves2" },
            {
                concept: "https://bob.com/bob",
                description: {},
                name: lovesName,
                iri: "https://bob.com/relationships#loves",
            },
        ],
    };

    const oneIriResult = bothEndsHaveAnIri(lovesWithOneIri);
    const bothIrisResult = bothEndsHaveAnIri(lovesWithBothIris);
    expect(oneIriResult).toBeFalsy();
    expect(bothIrisResult).toBeTruthy();
});

test("class is not an edge", () => {
    const john: SemanticModelClass = {
        name: { en: "john" },
        id: "123abc123",
        type: ["class"],
        description: { en: "he's a john", cs: "je to honza" },
        iri: null,
    };
    const isEdge = isAnEdge(john);
    expect(isEdge).toBe(false);
});

test("class is not an attribute", () => {
    const john: SemanticModelClass = {
        name: { en: "john" },
        id: "123abc123",
        type: ["class"],
        description: { en: "he's a john", cs: "je to honza" },
        iri: null,
    };
    const isAttr = isAnAttribute(john);
    expect(isAttr).toBe(false);
});

test("relationship is not an attribute", () => {
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
    const isAttr = isAnAttribute(loves);
    expect(isAttr).toBe(false);
});

test("get domain and range correctly", () => {
    const domain = {
        concept: "https://bob.com/jane",
        description: {},
        name: {},
        iri: null,
    } satisfies SemanticModelRelationshipEnd; // no iri!

    const range = {
        concept: "https://bob.com/bob",
        description: { en: "one loves another", cs: "jeden miluje druhého" },
        name: { en: "love", cs: "laska" },
        iri: "https://bob.com/relationships#loves",
    } satisfies SemanticModelRelationshipEnd;

    const loves: SemanticModelRelationship = {
        id: "123abc123",
        type: ["relationship"],
        name: {},
        description: {},
        iri: null,
        ends: [domain, range],
    };
    const domainAndRange = temporaryDomainRangeHelper(loves);
    expect(domainAndRange?.domain).toBe(domain);
    expect(domainAndRange?.range).toBe(range);
});
