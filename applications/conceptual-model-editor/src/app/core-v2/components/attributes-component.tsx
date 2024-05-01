import { EntityModel } from "@dataspecer/core-v2/entity-model";
import {
    SemanticModelRelationship,
    LanguageString,
    SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useState, useEffect } from "react";
import { getRandomName } from "~/app/utils/random-gen";
import { getModelIri } from "../util/model-utils";
import { CardinalityOptions } from "./cardinality-options";
import { IriInput } from "./input/iri-input";
import { MultiLanguageInputForLanguageString } from "./input/multi-language-input-4-language-string";
import { DialogDetailRow } from "./dialog-detail-row";
import { SelectProfiledAttribute } from "./input/select-profiled-attribute";

export const AddAttributesComponent = (props: {
    preferredLanguage: string;
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
    const [newAttributeIsProfileOf, setNewAttributeIsProfileOf] = useState<string | null>(null);
    const [changedFields, setChangedFields] = useState({
        name: false,
        description: false,
        cardinality: false,
        iri: false,
    });

    const modelIri = getModelIri(props.sourceModel);

    useEffect(() => {
        setNewAttribute({
            ends: [
                {
                    cardinality: cardinality.cardinality,
                    name: {},
                    description: {},
                    concept: props.modifiedClassId,
                    iri: null,
                },
                {
                    name,
                    description,
                    // @ts-ignore
                    concept: null, // TODO dataType
                    iri,
                },
            ],
        });
    }, [name, description, cardinality, iri]);

    const handleSave = () => {
        if (!newAttributeIsProfileOf) {
            props.saveNewAttribute(newAttribute);
            return;
        }

        console.log("profile selected", newAttributeIsProfileOf);
        props.saveNewAttributeProfile({
            usageOf: newAttributeIsProfileOf,
            ends: [
                {
                    cardinality: changedFields.cardinality ? cardinality.cardinality ?? null : null,
                    concept: props.modifiedClassId,
                    name: null,
                    description: null,
                    usageNote: {},
                },
                {
                    cardinality: null,
                    name: changedFields.name ? name : null,
                    description: changedFields.description ? description : null,
                    concept: null,
                    usageNote: {},
                },
            ],
        });
    };

    return (
        <div>
            <span className="text-xs italic">It is possible to add only one attribute rn.</span>
            <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16">
                <DialogDetailRow
                    detailKey="name"
                    detailValue={
                        <MultiLanguageInputForLanguageString
                            inputType="text"
                            ls={name}
                            setLs={setName}
                            defaultLang={props.preferredLanguage}
                            onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                        />
                    }
                />
                <DialogDetailRow
                    detailKey="description"
                    detailValue={
                        <MultiLanguageInputForLanguageString
                            inputType="text"
                            ls={description}
                            setLs={setDescription}
                            defaultLang={props.preferredLanguage}
                            onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                        />
                    }
                />
                <DialogDetailRow
                    detailKey="iri"
                    detailValue={
                        <IriInput
                            name={name}
                            iriHasChanged={iriHasChanged}
                            newIri={iri}
                            onChange={() => setIriHasChanged(true)}
                            setNewIri={(i) => setIri(i)}
                            baseIri={modelIri}
                            disabled={newAttributeIsProfileOf != null}
                        />
                    }
                />
                <DialogDetailRow
                    detailKey="cardinality"
                    detailValue={
                        <CardinalityOptions
                            group="source"
                            defaultCard={cardinality.cardinality}
                            setCardinality={setCardinality}
                            disabled={false}
                            onChange={() => setChangedFields((prev) => ({ ...prev, cardinality: true }))}
                        />
                    }
                />
                <DialogDetailRow
                    detailKey="is profile of"
                    detailValue={
                        <SelectProfiledAttribute
                            onAttributeSelected={(attributeId) => setNewAttributeIsProfileOf(attributeId)}
                        />
                    }
                />
            </div>
            <div className="flex flex-row justify-center">
                <button onClick={handleSave}>save</button>
            </div>
        </div>
    );
};
