import type { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import type {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getEntityTypeString } from "~/app/core-v2/util/detail-utils";

test("correct type name returned for entity", () => {
    const john: SemanticModelClass = {
        name: { en: "john" },
        id: "123abc123",
        type: ["class"],
        description: { en: "he's a john", cs: "je to honza" },
        iri: null,
    };

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
                name: {},
                iri: "https://bob.com/relationships#loves",
            },
        ],
    };

    const johnProfile: SemanticModelClassUsage = {
        id: "123johnprofile123",
        iri: "https://john.iri.com/its-profile",
        type: ["class-usage"],
        usageNote: {},
        usageOf: "john",
        name: null,
        description: null,
    };

    const isLovedProfile: SemanticModelRelationshipUsage = {
        id: "123abc123",
        type: ["relationship-usage"],
        name: {},
        description: {},
        iri: null,
        usageNote: {},
        usageOf: "123123isLovedBySomeone",
        ends: [
            { concept: "https://bob.com/jane", description: {}, name: {}, iri: null, usageNote: {}, cardinality: null },
            {
                concept: "http://www.w3.org/2001/XMLSchema#boolean",
                description: {},
                name: {},
                iri: "https://bob.com/relationships#loves",
                usageNote: {},
                cardinality: null,
            },
        ],
    };

    const johnType = getEntityTypeString(john);
    const lovesType = getEntityTypeString(loves);
    const johnProfileType = getEntityTypeString(johnProfile);
    const isLovedProfileType = getEntityTypeString(isLovedProfile);

    expect(johnType).toBe("class");
    expect(lovesType).toBe("relationship");
    expect(johnProfileType).toBe("class profile");
    expect(isLovedProfileType).toBe("relationship profile (attribute)");
});
