import {
    janesAgeAttribute,
    janesAgeIri,
    johnClass,
    johnsIri,
    localModelWithBaseIri,
    localModelBaseIri,
    lovesIri,
    lovesRelationship,
    localModelWithOutBaseIri,
    localModelId,
} from "./concepts";
import { getIri, getModelIri, isIriAbsolute } from "~/app/util/iri-utils";

test("get iris for different types", () => {
    const classIri = getIri(johnClass);
    const relIri = getIri(lovesRelationship);
    const attribIri = getIri(janesAgeAttribute);
    expect(classIri).toBe(johnsIri);
    expect(relIri).toBe(lovesIri);
    expect(attribIri).toBe(janesAgeIri);
});

test("iris with scheme are considered absolute", () => {
    const nullIriIsNotAbsolute = isIriAbsolute(null);
    const shouldBeAbsoluteIri = isIriAbsolute("https://concepts.com/bob");
    const shouldNotBeAbsoluteIriBcItIsRelative = isIriAbsolute("bob");

    expect(nullIriIsNotAbsolute).toBe(false);
    expect(shouldBeAbsoluteIri).toBe(true);
    expect(shouldNotBeAbsoluteIriBcItIsRelative).toBe(false);
});

test("model with base iri gets the iri returned", () => {
    const mIri = getModelIri(localModelWithBaseIri);
    expect(mIri).toBe(localModelBaseIri);
});

test("model without base iri get back the a placeholder", () => {
    const mIri = getModelIri(localModelWithOutBaseIri);
    expect(mIri).toContain("todo");
    expect(mIri).toContain(localModelId);
});
