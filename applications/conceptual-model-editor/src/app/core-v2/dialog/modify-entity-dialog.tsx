import {
    type SemanticModelClass,
    LanguageString,
    SemanticModelRelationship,
    isSemanticModelRelationship,
    isSemanticModelClass,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useClassesContext } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { useBaseDialog } from "../components/base-dialog";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipEndUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { getIri, getModelIri } from "../util/model-utils";
import { IriInput } from "../components/input/iri-input";
import { AddAttributesComponent } from "../components/attributes-component";
import { DomainRangeComponent } from "./domain-range-component";
import { createRelationship, deleteEntity, modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import { createRelationshipUsage, modifyClassUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { getDescriptionLanguageString, getNameLanguageString } from "../util/name-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { isSemanticModelAttributeUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { ProfileModificationWarning } from "../features/warnings/profile-modification-warning";
import { RemovableAttributeProfileRow, RemovableAttributeRow } from "../components/removable-attribute-row";
import { DialogColoredModelHeader } from "../components/dialog-colored-model-header";
import { DialogDetailRow } from "../components/dialog-detail-row";
import { MultiLanguageInputForLanguageStringWithOverride } from "../components/input/multi-language-input-4-language-string-with-override";
import { NewRemovableAttributeProfileRow, NewRemovableAttributeRow } from "../components/new-attribute-row";

type SupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

export const useModifyEntityDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [modifiedEntity, setModifiedEntity] = useState(null as unknown as SupportedTypes);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);

    const { executeMultipleOperations } = useClassesContext();

    const localClose = () => {
        setModifiedEntity(null as unknown as SemanticModelClass);
        setModel(null as unknown as InMemorySemanticModel);
        close();
    };
    const localOpen = (entity: SupportedTypes, model: InMemorySemanticModel | null = null) => {
        if (!model) {
            localClose();
        }
        setModifiedEntity(entity);
        setModel(model);
        open();
    };

    const ModifyEntityDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();

        const { modifyRelationship, updateEntityUsage, aggregatorView } = useModelGraphContext();

        const currentIri = getIri(modifiedEntity);

        const [name2, setName2] = useState(getNameLanguageString(modifiedEntity) ?? {});
        const [description2, setDescription2] = useState(getDescriptionLanguageString(modifiedEntity) ?? {}); // descriptionLanguageString ?? modifiedEntity.description ?? {});
        const [usageNote2, setUsageNote2] = useState<LanguageString>(
            isSemanticModelRelationshipUsage(modifiedEntity) ? modifiedEntity.usageNote ?? {} : {}
        );
        const isProfile = isSemanticModelClassUsage(modifiedEntity) || isSemanticModelRelationshipUsage(modifiedEntity);

        const [newIri, setNewIri] = useState(currentIri ?? undefined);
        const [changedFields, setChangedFields] = useState({
            name: false,
            description: false,
            iri: false,
            usageNote: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        });

        const currentDomainAndRange =
            isSemanticModelRelationship(modifiedEntity) || isSemanticModelRelationshipUsage(modifiedEntity)
                ? temporaryDomainRangeHelper(modifiedEntity)
                : null;

        const [newDomain, setNewDomain] = useState(
            currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd)
        );
        const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));

        const modelIri = getModelIri(model);

        const { relationships: r, profiles: p } = useClassesContext();
        const attributes = r
            .filter(isSemanticModelAttribute)
            .filter((v) => getDomainAndRange(v)?.domain.concept == modifiedEntity.id);
        const attributeProfiles = p
            .filter(isSemanticModelRelationshipUsage)
            .filter((a) =>
                isSemanticModelAttributeUsage(a as SemanticModelRelationshipUsage & SemanticModelRelationship)
            )
            .filter((v) => temporaryDomainRangeHelper(v)?.domain.concept == modifiedEntity.id);

        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttributes, setNewAttributes] = useState<Partial<Omit<SemanticModelRelationship, "type">>[]>([]);
        const [newAttributeProfiles, setNewAttributeProfiles] = useState<
            (Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[]
        >([]);
        const [toBeRemovedAttributes, setToBeRemovedAttributes] = useState<string[]>([]);

        const canHaveAttributes = isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity);
        const canHaveDomainAndRange =
            isSemanticModelRelationship(modifiedEntity) || isSemanticModelRelationshipUsage(modifiedEntity);

        const changedFieldsAsStringArray = Object.entries(changedFields)
            .filter(([key, _]) => key != "name" && key != "description" && key != "iri" && key != "usageNote")
            .filter(([_, v]) => v == true)
            .map(([key, _]) => key);

        const handleSaveClassOrClassProfile = (m: InMemorySemanticModel) => {
            // TODO: something broken with attribute profiles
            const operations = [];
            if (isSemanticModelClass(modifiedEntity)) {
                let c = {} as Partial<Omit<SemanticModelClass, "type" | "id">>;
                c = changedFields.name ? { ...c, name: name2, iri: newIri } : c;
                c = changedFields.description ? { ...c, description: description2 } : c;
                c = changedFields.iri ? { ...c, iri: newIri } : c;

                if (Object.entries(c).length > 0) {
                    operations.push(modifyClass(modifiedEntity.id, c));
                }
            } else {
                let cu = {} as Partial<Omit<SemanticModelClassUsage, "type" | "usageOf">>;
                cu = changedFields.name ? { ...cu, name: name2 } : cu;
                cu = changedFields.description ? { ...cu, description: description2 } : cu;
                cu = changedFields.usageNote ? { ...cu, usageNote: usageNote2 } : cu;

                if (Object.entries(cu).length > 0) {
                    operations.push(modifyClassUsage(modifiedEntity.id, cu));
                }
            }

            for (const attribute of newAttributes) {
                operations.push(createRelationship(attribute));
            }

            for (const attributeProfile of newAttributeProfiles) {
                operations.push(createRelationshipUsage(attributeProfile));
            }

            for (const rem of toBeRemovedAttributes) {
                operations.push(deleteEntity(rem));
                console.log("todo remove entity from attribute's domain", rem);
            }
            executeMultipleOperations(m, operations);
        };

        const handleSaveRelationship = (entity: SemanticModelRelationship, m: InMemorySemanticModel) => {
            const domainCard =
                newDomain.cardinality != currentDomainAndRange?.domain?.cardinality
                    ? newDomain.cardinality
                    : currentDomainAndRange?.domain?.cardinality;
            const rangeCard =
                newRange.cardinality != currentDomainAndRange?.range?.cardinality
                    ? newRange.cardinality
                    : currentDomainAndRange?.range?.cardinality;

            const domainEnd = {
                ...currentDomainAndRange!.domain,
                concept: newDomain.concept ?? currentDomainAndRange?.domain.concept ?? null,
                cardinality: domainCard,
            } as SemanticModelRelationshipEnd;
            const rangeEnd = {
                ...currentDomainAndRange!.range,
                concept: newRange.concept ?? currentDomainAndRange?.range.concept ?? null,
                name: name2,
                iri: newIri ?? null,
                description: description2,
                cardinality: rangeCard,
            } as SemanticModelRelationshipEnd;

            let ends: SemanticModelRelationshipEnd[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            const result = modifyRelationship(m, modifiedEntity.id, {
                ends,
            });
            return result;
        };

        const handleSaveRelationshipProfile = (m: InMemorySemanticModel) => {
            const domainEnd = {
                concept: changedFields.domain ? newDomain.concept : null,
                name: null,
                description: null,
                cardinality: changedFields.domain ? newDomain.cardinality : null,
                usageNote: null,
            } as SemanticModelRelationshipEndUsage;
            const rangeEnd = {
                concept: changedFields.range ? newRange.concept : null,
                name: changedFields.name ? name2 : null,
                description: changedFields.description ? description2 : null,
                cardinality: changedFields.range ? newRange.cardinality : null,
                usageNote: changedFields.usageNote ? usageNote2 : null,
            } as SemanticModelRelationshipEndUsage;

            let ends: SemanticModelRelationshipEndUsage[];
            if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                ends = [rangeEnd, domainEnd];
            } else {
                ends = [domainEnd, rangeEnd];
            }

            const res = updateEntityUsage(m, "relationship-usage", modifiedEntity.id, {
                usageNote: changedFields.usageNote ? usageNote2 : null,
                ends,
            });
            console.log(res, "relationship profile updated", usageNote2, description2, name2, newRange, newDomain);
        };

        const handleSaveButtonClicked = () => {
            console.log("save button clicked", name2, newIri, description2, newAttributes);
            if (!model) {
                alert(`model is null`);
                close();
                return;
            }

            if (isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity)) {
                handleSaveClassOrClassProfile(model);
            } else if (isSemanticModelRelationship(modifiedEntity)) {
                handleSaveRelationship(modifiedEntity, model);
            } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
                handleSaveRelationshipProfile(model);
            }

            close();
        };

        return (
            <BaseDialog heading="Entity modification">
                <div>
                    <DialogColoredModelHeader
                        activeModel={model}
                        style="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16 pb-4 pt-2"
                    />
                    <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16">
                        <DialogDetailRow
                            detailKey="name"
                            detailValue={
                                <MultiLanguageInputForLanguageStringWithOverride
                                    style="text-xl"
                                    forElement="modify-entity-name"
                                    inputType="text"
                                    ls={name2}
                                    setLs={setName2}
                                    defaultLang={preferredLanguage}
                                    disabled={isProfile && !changedFields.name}
                                    onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                                    withOverride={isProfile}
                                />
                            }
                        />

                        {/* 
                        ---------
                        Entity id
                        ---------
                        */}

                        <DialogDetailRow detailKey="id" detailValue={modifiedEntity.id} />

                        {/* 
                        ----------
                        Entity IRI
                        ----------
                        */}

                        {!isProfile && (
                            <DialogDetailRow
                                detailKey="iri"
                                detailValue={
                                    <IriInput
                                        name={name2}
                                        iriHasChanged={changedFields.iri}
                                        newIri={newIri}
                                        setNewIri={(i) => setNewIri(i)}
                                        onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                                        baseIri={modelIri}
                                    />
                                }
                            />
                        )}

                        {/* 
                        ------------------
                        Entity description
                        ------------------
                        */}

                        <DialogDetailRow
                            detailKey="description"
                            detailValue={
                                <MultiLanguageInputForLanguageStringWithOverride
                                    forElement="modify-entity-description"
                                    inputType="textarea"
                                    ls={description2}
                                    setLs={setDescription2}
                                    defaultLang={preferredLanguage}
                                    disabled={isProfile && !changedFields.description}
                                    onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                                    withOverride={isProfile}
                                />
                            }
                        />

                        {isProfile && (
                            <DialogDetailRow
                                detailKey="usage (profile?) note"
                                detailValue={
                                    <MultiLanguageInputForLanguageString
                                        inputType="text"
                                        ls={usageNote2}
                                        setLs={setUsageNote2}
                                        defaultLang={preferredLanguage}
                                        onChange={() => setChangedFields((prev) => ({ ...prev, usageNote: true }))}
                                    />
                                }
                            />
                        )}

                        {/* 
                        --------------------------------------
                        Attributes for class and class profile
                        --------------------------------------
                        */}

                        {canHaveAttributes && (
                            <>
                                <DialogDetailRow
                                    detailKey="attributes"
                                    detailValue={
                                        <>
                                            {attributes.map((v) => (
                                                <RemovableAttributeRow
                                                    attribute={v}
                                                    toBeRemoved={toBeRemovedAttributes.includes(v.id)}
                                                    addToToBeRemoved={() =>
                                                        setToBeRemovedAttributes((prev) => prev.concat(v.id))
                                                    }
                                                    key={"to-be-removed" + v.id}
                                                />
                                            ))}
                                            {newAttributes.map((a) => (
                                                <NewRemovableAttributeRow
                                                    attribute={a}
                                                    deleteButtonClicked={() => {
                                                        setNewAttributes((prev) => prev.filter((v1) => v1 != a));
                                                    }}
                                                />
                                            ))}
                                        </>
                                    }
                                    style="flex flex-col"
                                />
                                <DialogDetailRow
                                    detailKey="attributes profiles"
                                    detailValue={
                                        <>
                                            {attributeProfiles.map((ap) => (
                                                <RemovableAttributeProfileRow
                                                    attribute={ap}
                                                    toBeRemoved={toBeRemovedAttributes.includes(ap.id)}
                                                    addToToBeRemoved={() =>
                                                        setToBeRemovedAttributes((prev) => prev.concat(ap.id))
                                                    }
                                                    key={"removable-attribute-profile" + ap.id}
                                                />
                                            ))}

                                            {newAttributeProfiles.map((ap) => (
                                                <NewRemovableAttributeProfileRow
                                                    resource={ap}
                                                    deleteButtonClicked={() =>
                                                        setNewAttributeProfiles((prev) => prev.filter((v1) => v1 != ap))
                                                    }
                                                />
                                            ))}
                                        </>
                                    }
                                    style="flex flex-col"
                                />
                            </>
                        )}

                        {/* 
                        -----------------------------------------------------------
                        Range and domain for a relationship or relationship profile
                        -----------------------------------------------------------
                        */}

                        {canHaveDomainAndRange && (
                            <>
                                {isProfile && changedFieldsAsStringArray.length > 0 && (
                                    <>
                                        <DialogDetailRow
                                            detailKey="warning"
                                            detailValue={
                                                <ProfileModificationWarning
                                                    changedFields={changedFieldsAsStringArray}
                                                />
                                            }
                                        />
                                    </>
                                )}
                                <DomainRangeComponent
                                    enabledFields={changedFields}
                                    withCheckEnabling={isProfile}
                                    entity={modifiedEntity}
                                    range={newRange}
                                    setRange={setNewRange}
                                    domain={newDomain}
                                    setDomain={setNewDomain}
                                    onDomainChange={() => setChangedFields((prev) => ({ ...prev, domain: true }))}
                                    onDomainCardinalityChange={() =>
                                        setChangedFields((prev) => ({ ...prev, domainCardinality: true }))
                                    }
                                    onRangeChange={() => setChangedFields((prev) => ({ ...prev, range: true }))}
                                    onRangeCardinalityChange={() =>
                                        setChangedFields((prev) => ({ ...prev, rangeCardinality: true }))
                                    }
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* 
                -----------------------------------------------------
                Adding new attributes to class or TODO: class profile
                -----------------------------------------------------
                */}

                {canHaveAttributes && (
                    <p className="bg-slate-100">
                        <div className="flex flex-row justify-between">
                            <button
                                className="ml-8 bg-slate-300"
                                onClick={() => setWantsToAddNewAttributes((prev) => !prev)}
                            >
                                {wantsToAddNewAttributes ? "cancel" : "add attribute"}
                            </button>
                        </div>
                        <div>
                            {wantsToAddNewAttributes && (
                                <AddAttributesComponent
                                    preferredLanguage={preferredLanguage}
                                    sourceModel={model}
                                    modifiedClassId={modifiedEntity.id}
                                    saveNewAttribute={(attribute: Partial<Omit<SemanticModelRelationship, "type">>) => {
                                        setNewAttributes((prev) => prev.concat(attribute));
                                        setWantsToAddNewAttributes(false);
                                    }}
                                    saveNewAttributeProfile={(
                                        attributeProfile: Partial<Omit<SemanticModelRelationshipUsage, "type">> &
                                            Pick<SemanticModelRelationshipUsage, "usageOf">
                                    ) => {
                                        setNewAttributeProfiles((prev) => prev.concat(attributeProfile));
                                        setWantsToAddNewAttributes(false);
                                    }}
                                />
                            )}
                        </div>
                    </p>
                )}

                {/* 
                ----------------------------
                Save and cancel button group
                ----------------------------
                */}

                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <button
                        disabled={wantsToAddNewAttributes}
                        className=" hover:disabled:cursor-not-allowed"
                        title={wantsToAddNewAttributes ? "first save the attribute or cancel the action" : ""}
                        onClick={handleSaveButtonClicked}
                    >
                        save
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </BaseDialog>
        );
    };

    return {
        isModifyEntityDialogOpen: isOpen,
        closeModifyEntityDialog: localClose,
        openModifyEntityDialog: localOpen,
        ModifyEntityDialog,
    };
};
