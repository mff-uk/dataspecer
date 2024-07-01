import type { EntityModel } from "@dataspecer/core-v2/entity-model";
import type {
    SemanticModelRelationship,
    LanguageString,
    SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useState, useEffect } from "react";
import { getRandomName } from "~/app/utils/random-gen";
import { getModelIri } from "../../util/iri-utils";
import { CardinalityOptions } from "../cardinality-options";
import { IriInput } from "../input/iri-input";
import { MultiLanguageInputForLanguageString } from "../input/multi-language-input-4-language-string";
import { DialogDetailRow } from "./dialog-detail-row";
import { SelectDatatype } from "../input/select-datatype";
import { t } from "../../application/";

export const AddAttributesComponent = (props: {
    preferredLanguage: string;
    sourceModel: EntityModel | null;
    modifiedClassId: string;
    saveNewAttribute: (attr: Partial<Omit<SemanticModelRelationship, "type">>) => void;
}) => {
    const { preferredLanguage, sourceModel, modifiedClassId, saveNewAttribute } = props;

    const [newAttribute, setNewAttribute] = useState<Partial<Omit<SemanticModelRelationship, "type">>>({});
    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [cardinality, setCardinality] = useState({} as SemanticModelRelationshipEnd);
    const [dataType, setDataType] = useState<string | null>(null);
    const [iri, setIri] = useState(getRandomName(7));
    const [changedFields, setChangedFields] = useState({
        iri: false,
        name: false,
        description: false,
        cardinality: false,
        dataType: false,
    });

    const modelIri = getModelIri(sourceModel);

    useEffect(() => {
        setNewAttribute({
            ends: [
                {
                    cardinality: cardinality.cardinality,
                    name: {},
                    description: {},
                    concept: modifiedClassId,
                    iri: null,
                },
                {
                    name,
                    description,
                    iri,
                    concept: dataType,
                },
            ],
        });
    }, [modifiedClassId, name, description, cardinality, iri, dataType]);

    const handleSave = () => {
        saveNewAttribute(newAttribute);
    };

    return (
        <div>
            <span className="text-xs italic">It is possible to add only one attribute rn.</span>
            <div className="grid grid-cols-1 gap-y-3 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pl-8 md:pr-16">
                <DialogDetailRow detailKey={t("attributes-component.name")}>
                    <MultiLanguageInputForLanguageString
                        inputType="text"
                        ls={name}
                        setLs={setName}
                        defaultLang={preferredLanguage}
                        onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                    />
                </DialogDetailRow>
                <DialogDetailRow detailKey={t("attributes-component.description")}>
                    <MultiLanguageInputForLanguageString
                        inputType="text"
                        ls={description}
                        setLs={setDescription}
                        defaultLang={preferredLanguage}
                        onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                    />
                </DialogDetailRow>
                <DialogDetailRow detailKey={t("attributes-component.iri")}>
                    <IriInput
                        name={name}
                        iriHasChanged={changedFields.iri}
                        newIri={iri}
                        onChange={() => {
                            setChangedFields((prev) => ({ ...prev, iri: true }));
                        }}
                        setNewIri={(i) => setIri(i)}
                        baseIri={modelIri}
                    />
                </DialogDetailRow>
                <DialogDetailRow detailKey={t("attributes-component.cardinality")}>
                    <CardinalityOptions
                        group="source"
                        defaultCard={cardinality.cardinality}
                        setCardinality={setCardinality}
                        disabled={false}
                        onChange={() => setChangedFields((prev) => ({ ...prev, cardinality: true }))}
                    />
                </DialogDetailRow>
                <DialogDetailRow detailKey={t("attributes-component.datatype")}>
                    <SelectDatatype
                        valueSelected={null}
                        onOptionSelected={(value) => setDataType(value)}
                        onChange={() => setChangedFields((prev) => ({ ...prev, dataType: true }))}
                    />
                </DialogDetailRow>
            </div>
            <div className="my-1 flex flex-row justify-center">
                <button className="ml-8 bg-white px-2 py-1 hover:shadow-sm" onClick={handleSave}>
                    ✅ add
                </button>
            </div>
        </div>
    );
};
