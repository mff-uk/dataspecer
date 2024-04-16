import {
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedString, getStringFromLanguageStringInLang } from "../util/language-utils";
import { CardinalityOptions, semanticCardinalityToOption } from "./cardinality-options";
import {
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { Dispatch, SetStateAction } from "react";
import { useConfigurationContext } from "../context/configuration-context";
import { useClassesContext } from "../context/classes-context";
import { isAttribute } from "../util/utils";

export const DomainRangeComponent = (props: {
    entity: SemanticModelRelationship | SemanticModelRelationshipUsage;
    range: SemanticModelRelationshipEnd;
    setRange: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
    domain: SemanticModelRelationshipEnd;
    setDomain: Dispatch<SetStateAction<SemanticModelRelationshipEnd>>;
}) => {
    const { language: preferredLanguage } = useConfigurationContext();
    const { classes2, profiles: p } = useClassesContext();
    const { entity, range, setRange, domain, setDomain } = props;

    const classesOrProfiles = [...classes2, ...p.filter(isSemanticModelClassUsage)];

    console.log(entity, range, domain);

    return (
        <>
            <div className="font-semibold">domain:</div>
            <select onChange={(e) => setDomain((prev) => ({ ...prev, concept: e.target.value }))}>
                <option disabled={true} selected={domain.concept == "" || domain.concept == null}>
                    ---
                </option>
                {classesOrProfiles.map((v) => {
                    const displayName = getLocalizedString(
                        getStringFromLanguageStringInLang(v.name || {}, preferredLanguage)
                    );
                    const iriOrId = isSemanticModelClassUsage(v) ? v.id : v.iri ?? v.id;

                    return (
                        <option value={v.id} selected={domain.concept == v.id}>
                            {displayName ?? iriOrId}
                        </option>
                    );
                })}
            </select>
            <div className="font-semibold">domain cardinality:</div>
            <div>
                <CardinalityOptions
                    group="source"
                    defaultCard={semanticCardinalityToOption(domain?.cardinality ?? null)}
                    setCardinality={setDomain}
                />
            </div>
            <div className="font-semibold">range:</div>
            <div className="flex w-full flex-row">
                {(isSemanticModelAttribute(entity) || isAttribute(entity)) && (
                    <div className="mr-4">
                        attribute
                        <span className="ml-1" title="setting a range makes this attribute more of a relationship">
                            ❓
                        </span>
                    </div>
                )}
                <select
                    className="w-full"
                    onChange={(e) => {
                        if (e.target.value == "null") {
                            // @ts-ignore
                            setRange((prev) => ({ ...prev, concept: undefined }));
                        } else {
                            setRange((prev) => ({ ...prev, concept: e.target.value }));
                        }
                    }}
                >
                    <option
                        // disabled={!isSemanticModelAttribute(entity)}
                        defaultChecked={isSemanticModelAttribute(entity) || isAttribute(entity)}
                        value={"null"}
                    >
                        ---
                    </option>
                    {classesOrProfiles.map((v) => {
                        const displayName = getLocalizedString(
                            getStringFromLanguageStringInLang(v.name || {}, preferredLanguage)
                        );
                        const iriOrId = isSemanticModelClassUsage(v) ? v.id : v.iri ?? v.id;

                        return (
                            <option value={v.id} selected={range.concept == v.id}>
                                {displayName ?? iriOrId}
                            </option>
                        );
                    })}
                </select>
            </div>
            {/* show range cardinality only when range is selected */}
            {range.concept && (
                <>
                    <div className="font-semibold">range cardinality:</div>
                    <CardinalityOptions
                        group="target"
                        defaultCard={semanticCardinalityToOption(range?.cardinality ?? null)}
                        setCardinality={setRange}
                    />
                </>
            )}
        </>
    );
};
