import { EntityModel } from "@dataspecer/core-v2/entity-model";
import {
    SemanticModelRelationship,
    LanguageString,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useState, useEffect } from "react";
import { getRandomName } from "~/app/utils/random-gen";
import { useClassesContext } from "../context/classes-context";
import { getAvailableLanguagesForLanguageString, getNameOrIriAndDescription } from "../util/language-utils";
import { getModelIri } from "../util/model-utils";
import { CardinalityOptions, semanticCardinalityToOption } from "./cardinality-options";
import { IriInput } from "./iri-input";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";

export const AddAttributesComponent = (props: {
    sourceModel: EntityModel | null;
    modifiedClassId: string;
    saveNewAttribute: (attr: Partial<Omit<SemanticModelRelationship, "type">>) => void;
    saveNewAttributeProfile: (
        attr: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">
    ) => void;
}) => {
    const [newAttribute, setNewAttribute] = useState<Partial<Omit<SemanticModelRelationship, "type">>>({});
    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [cardinality, setCardinality] = useState({} as SemanticModelRelationshipEnd);
    const [iri, setIri] = useState(getRandomName(7)); // todo
    const [iriHasChanged, setIriHasChanged] = useState(false);
    const { relationships } = useClassesContext();
    const [newAttributeIsProfileOf, setNewAttributeIsProfileOf] = useState<string | null>(null);

    const modelIri = getModelIri(props.sourceModel);

    useEffect(() => {
        setNewAttribute({
            // iri,
            ends: [
                { cardinality: [0, null], name: {}, description: {}, concept: props.modifiedClassId, iri: null },
                {
                    cardinality: cardinality.cardinality, // TODO: cardinality
                    name,
                    description,
                    // @ts-ignore
                    concept: null, // TODO dataType
                    iri,
                },
            ],
        });
    }, [name, description, cardinality, iri]);

    return (
        <div>
            <span className="text-xs italic">It is possible to add only one attribute rn.</span>
            <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16">
                <div className="font-semibold">name:</div>
                <div>
                    <MultiLanguageInputForLanguageString
                        inputType="text"
                        ls={name}
                        setLs={setName}
                        defaultLang={getAvailableLanguagesForLanguageString(name)[0] ?? "en"}
                    />
                </div>
                <div className="font-semibold">description:</div>
                <div>
                    <MultiLanguageInputForLanguageString
                        inputType="text"
                        ls={description}
                        setLs={setDescription}
                        defaultLang={getAvailableLanguagesForLanguageString(description)[0] ?? "en"}
                    />
                </div>
                <div className="font-semibold">relative iri:</div>
                <div className="flex flex-row">
                    <div className="text-nowrap">{modelIri}</div>
                    <IriInput
                        name={name}
                        iriHasChanged={iriHasChanged}
                        newIri={iri}
                        setIriHasChanged={(v) => setIriHasChanged(v)}
                        setNewIri={(i) => setIri(i)}
                    />
                </div>
                <div className="font-semibold">cardinality:</div>
                <div>
                    <CardinalityOptions
                        group="source"
                        defaultCard={semanticCardinalityToOption(cardinality?.cardinality ?? null)}
                        setCardinality={setCardinality}
                    />
                </div>
                <div>is profile of:</div>
                <select
                    onChange={(e) => {
                        setNewAttributeIsProfileOf(e.target.value);
                    }}
                >
                    <option>---</option>
                    {relationships.filter(isSemanticModelAttribute).map((a) => {
                        const [name, descr] = getNameOrIriAndDescription(a.ends.at(1), a.iri || a.id);
                        return (
                            <option title={descr ?? ""} value={a.id}>
                                {name}:{a.id}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="flex flex-row justify-center">
                <button
                    onClick={() => {
                        if (newAttributeIsProfileOf) {
                            console.log("profile selected", newAttributeIsProfileOf);
                            props.saveNewAttributeProfile({
                                usageOf: newAttributeIsProfileOf,
                                // name,
                                // description,
                                // ends: TODO az bude jasne, jestli maji byt konce taky ..shipEndUsage nebo jen ..shipEnd
                                ends: [
                                    {
                                        cardinality: [0, null],
                                        name: {},
                                        description: {},
                                        concept: props.modifiedClassId,
                                        usageNote: {},
                                    },
                                    {
                                        cardinality: cardinality.cardinality ?? null,
                                        name,
                                        description,
                                        concept: null,
                                        usageNote: {},
                                    },
                                ],
                            });
                        } else {
                            props.saveNewAttribute(newAttribute);
                        }
                    }}
                >
                    save
                </button>
            </div>
        </div>
    );
};
