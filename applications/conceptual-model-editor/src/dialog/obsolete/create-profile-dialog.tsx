import { ModelGraphContextType } from "../../context/model-context";
import { filterInMemoryModels } from "../../util/model-utils";
import { MultiLanguageInputForLanguageString } from "../../components/input/multi-language-input-4-language-string";
import {
    type LanguageString,
    type SemanticModelClass,
    type SemanticModelRelationship,
    type SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { DomainRangeComponent } from "../components/domain-range-component";
import { getDescriptionLanguageString, getNameLanguageString } from "../../util/name-utils";
import { temporaryDomainRangeHelper } from "../../util/relationship-utils";
import { ProfileModificationWarning } from "../../features/warnings/profile-modification-warning";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { getEntityTypeString, createEntityProxy } from "../../util/detail-utils";
import { MultiLanguageInputForLanguageStringWithOverride } from "../../components/input/multi-language-input-4-language-string-with-override";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { DialogColoredModelHeaderWithModelSelector } from "../../components/dialog/dialog-colored-model-header";
import { getIri } from "../../util/iri-utils";
import { getRandomName } from "../../util/random-gen";
import { IriInput } from "../../components/input/iri-input";
import { ClassesContextType } from "../../context/classes-context";
import { type OverriddenFieldsType, getDefaultOverriddenFields, isSemanticProfile } from "../../util/profile-utils";
import { t } from "../../application";
import { prefixForIri } from "../../service/prefix-service";
import { DialogProps, DialogWrapper } from "../dialog-api";
import { findSourceModelOfEntity } from "../../service/model-service";

export type SupportedTypes =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage;

export interface CreateProfileState {

    entity: SupportedTypes;

    language: string;

    isAttribute: boolean;

    hasDomainAndRange: boolean;

    displayNameOfProfiledEntity: string | null;

    //

    iri: string;

    name: LanguageString;

    description: LanguageString;

    usageNote: LanguageString;

    domain: SemanticModelRelationshipEnd;

    range: SemanticModelRelationshipEnd;

    //

    model: InMemorySemanticModel;

    models: InMemorySemanticModel[];

    changedFields: ChangedFieldsType;

    overriddenFields: OverriddenFieldsType;

}

export type ChangedFieldsType = {
    name: boolean,
    description: boolean,
    iri: boolean,
    domain: boolean,
    domainCardinality: boolean,
    range: boolean,
    rangeCardinality: boolean,
};

export const createEntityProfileDialog = (
    classes: ClassesContextType,
    graph: ModelGraphContextType,
    entity: SupportedTypes,
    language: string,
    onConfirm: (state: CreateProfileState) => void,
): DialogWrapper<CreateProfileState> => {
    return {
        label: "create-profile-dialog.label",
        component: CreateProfileDialog,
        state: createCreateProfileState(classes, graph, entity, language),
        confirmLabel: "create-profile-dialog.btn-ok",
        cancelLabel: "create-profile-dialog.btn-close",
        validate: () => true,
        onConfirm: onConfirm,
        onClose: null,
    };
}

function createCreateProfileState(
    classes: ClassesContextType,
    graph: ModelGraphContextType,
    entity: SupportedTypes,
    language: string,
): CreateProfileState {
    const entityProxy = createEntityProxy(classes, graph, entity);
    const domainAndRange = entityProxy.canHaveDomainAndRange ? temporaryDomainRangeHelper(entity) : null;
    const models = filterInMemoryModels([...graph.models.values()]);
    // By default we need to create a model in the first model not the model of the entity.
    let model = models[0];
    return {
        entity,
        language,
        isAttribute: isSemanticModelAttribute(entity) || isSemanticModelAttributeUsage(entity),
        hasDomainAndRange: isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity),
        displayNameOfProfiledEntity: entity ? entityProxy.name : null,
        //
        iri: suggestNewProfileIri(entity),
        name: getEntityNameOrEmpty(entity),
        description: getEntityDescriptionOrEmpty(entity),
        usageNote: getEntityUsageNoteOrEmpty(entity),
        domain: domainAndRange?.domain ?? {} as SemanticModelRelationshipEnd,
        range: domainAndRange?.range ?? {} as SemanticModelRelationshipEnd,
        //
        model: model,
        models: models,
        changedFields: {
            name: false,
            description: false,
            iri: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        },
        overriddenFields: getDefaultOverriddenFields(),
    }
}

const getEntityNameOrEmpty = (entity: SupportedTypes): LanguageString => {
    return getNameLanguageString(entity) ?? {};
};

const getEntityDescriptionOrEmpty = (entity: SupportedTypes): LanguageString => {
    return getDescriptionLanguageString(entity) ?? {};
};

const getEntityUsageNoteOrEmpty = (entity: SupportedTypes): LanguageString => {
    return isSemanticProfile(entity) ? entity.usageNote ?? {} : {};
};

function suggestNewProfileIri(entity: SupportedTypes | null): string {
    const entityIri = getIri(entity);
    if (entityIri === null) {
        return getRandomName(8);
    }
    const tailIndex = Math.max(entityIri.lastIndexOf("/"), entityIri.lastIndexOf("#"));
    if (tailIndex === -1) {
        // It does not even look like an IRI we just return it.
        return entityIri;
    }
    const head = entityIri.slice(0, tailIndex + 1);
    const tail = entityIri.slice(tailIndex + 1);
    const prefix = prefixForIri(head);
    if (prefix === null) {
        return tail;
    }
    return `${prefix}-${tail}`;
}

const CreateProfileDialog = (props: DialogProps<CreateProfileState>) => {
    // const { language: preferredLanguage } = useOptions();
    // const { createClassEntityUsage, createRelationshipEntityUsage } = useClassesContext();
    // const { models, aggregatorView } = useModelGraphContext();
    // const inMemoryModels = filterInMemoryModels([...models.values()]);
    // const actions = useActions();
    //
    // const [usageNote, setUsageNote] = useState<LanguageString>({});
    // const [name, setName] = useState<LanguageString>(getNameLanguageString(entity) ?? {});
    // const [description, setDescription] = useState<LanguageString>(getDescriptionLanguageString(entity) ?? {});
    // const [activeModel, setActiveModel] = useState(inMemoryModels.at(0)?.getId() ?? "---");
    // const [newIri, setNewIri] = useState(suggestNewProfileIri(entity));
    // const [changedFields, setChangedFields] = useState({
    //     name: false,
    //     description: false,
    //     iri: false,
    //     domain: false,
    //     domainCardinality: false,
    //     range: false,
    //     rangeCardinality: false,
    // });
    //
    // const [overriddenFields, setOverriddenFields] = useState<OverriddenFieldsType>(getDefaultOverriddenFields());

    const setIri = (next: string) =>
        props.changeState(prev => ({ ...prev, iri: next }));
    const setName = (setter: (prev: LanguageString) => LanguageString) =>
        props.changeState(prev => ({ ...prev, name: setter(prev.name) }));
    const setDescription = (setter: (prev: LanguageString) => LanguageString) =>
        props.changeState(prev => ({ ...prev, description: setter(prev.description) }));
    const setUsageNote = (setter: (prev: LanguageString) => LanguageString) =>
        props.changeState(prev => ({ ...prev, usageNote: setter(prev.usageNote) }));
    const setNewDomain = (setter: (prev: SemanticModelRelationshipEnd) => SemanticModelRelationshipEnd) =>
        props.changeState(state => ({ ...state, domain: setter(state.domain) }));
    const setNewRange = (setter: (prev: SemanticModelRelationshipEnd) => SemanticModelRelationshipEnd) =>
        props.changeState(state => ({ ...state, range: setter(state.range) }));

    const setChangedFields = (setter: (prev: ChangedFieldsType) => ChangedFieldsType) =>
        props.changeState(state => ({ ...state, changedFields: setter(state.changedFields) }));
    const setOverriddenFields = (setter: (prev: OverriddenFieldsType) => OverriddenFieldsType) =>
        props.changeState(state => ({ ...state, overriddenFields: setter(state.overriddenFields) }));

    const setActiveModel = (id: string) => {
        for (const model of props.state.models) {
            if (model.getId() !== id) {
                continue;
            }
            props.changeState(prev => ({ ...prev, model }));
            return;
        }
    };

    // --- relationships and relationship profiles --- --- ---
    // const hasDomainAndRange = isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity);
    // const currentDomainAndRange =
    //     isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)
    //         ? temporaryDomainRangeHelper(entity)
    //         : null;
    //
    // const [newDomain, setNewDomain] = useState(
    //     currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd)
    // );
    // const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));

    // --- model it comes from --- --- ---

    // const model = inMemoryModels.find((m) => m.getId() == activeModel);
    // const modelIri = getModelIri(model);

    // --- profiling --- --- ---

    // const displayNameOfProfiledEntity = entity ? useEntityProxy(entity, preferredLanguage).name : null;

    const changedFieldsAsStringArray = Object.entries(props.state.changedFields)
        .filter(([key, _]) => key != "name" && key != "description")
        .filter(([_, v]) => v == true)
        .map(([key, _]) => key);

    // if (inMemoryModels.length == 0) {
    //     alert("Create a local model first, please");
    //     localClose();
    //     return;
    // }

    return (
        <>
            <div>
                <DialogColoredModelHeaderWithModelSelector
                    style="grid grid-cols-1 px-1 md:grid-cols-[25%_75%] gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
                    activeModel={props.state.model.getId()}
                    onModelSelected={setActiveModel}
                />
                <div className="grid grid-cols-1 gap-y-3 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pb-4 md:pl-8 md:pr-16 md:pt-2">
                    <DialogDetailRow detailKey={t("create-profile-dialog.profiled")}>
                        {props.state.displayNameOfProfiledEntity}
                    </DialogDetailRow>
                    <DialogDetailRow detailKey={t("create-profile-dialog.profiled-type")}>
                        {getEntityTypeString(props.state.entity)}
                    </DialogDetailRow>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-y-3 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pb-4 md:pl-8 md:pr-16 md:pt-2">

                <DialogDetailRow detailKey={t("create-profile-dialog.name")}>
                    <MultiLanguageInputForLanguageStringWithOverride
                        forElement="create-profile-name"
                        ls={props.state.name}
                        setLs={setName}
                        defaultLang={props.state.language}
                        inputType="text"
                        withOverride={{
                            callback: () => setOverriddenFields((prev) => ({ ...prev, name: !prev.name })),
                            defaultValue: false,
                        }}
                        disabled={!props.state.overriddenFields.name}
                        onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                    />
                </DialogDetailRow>

                <DialogDetailRow detailKey={t("create-profile-dialog.iri")}>
                    <IriInput
                        name={props.state.name}
                        newIri={props.state.iri}
                        setNewIri={(i) => setIri(i)}
                        iriHasChanged={props.state.changedFields.iri}
                        onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                        baseIri={props.state.model.getBaseIri()}
                    />
                </DialogDetailRow>

                <DialogDetailRow detailKey={t("create-profile-dialog.description")}>
                    <MultiLanguageInputForLanguageStringWithOverride
                        forElement="create-profile-description"
                        ls={props.state.description}
                        setLs={setDescription}
                        defaultLang={props.state.language}
                        inputType="textarea"
                        withOverride={{
                            callback: () =>
                                setOverriddenFields((prev) => ({ ...prev, description: !prev.description })),
                            defaultValue: false,
                        }}
                        disabled={!props.state.overriddenFields.description}
                        onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                    />
                </DialogDetailRow>

                <DialogDetailRow detailKey={t("create-profile-dialog.usage-note")}>
                    <MultiLanguageInputForLanguageString
                        ls={props.state.usageNote}
                        setLs={setUsageNote}
                        defaultLang={props.state.language}
                        inputType="textarea"
                    />
                </DialogDetailRow>

                {props.state.hasDomainAndRange && (
                    <DomainRangeComponent
                        entity={props.state.entity as unknown as any}
                        domain={props.state.domain}
                        setDomain={setNewDomain}
                        onDomainChange={() => setChangedFields((prev) => ({ ...prev, domain: true }))}
                        onDomainCardinalityChange={() =>
                            setChangedFields((prev) => ({ ...prev, domainCardinality: true }))
                        }
                        range={props.state.range}
                        setRange={setNewRange}
                        onRangeChange={() => setChangedFields((prev) => ({ ...prev, range: true }))}
                        onRangeCardinalityChange={() =>
                            setChangedFields((prev) => ({ ...prev, rangeCardinality: true }))
                        }
                        withOverride={{
                            overriddenFields: props.state.overriddenFields,
                            setOverriddenFields
                        }}
                        hideCardinality={false}
                        isProfile={true}
                        isAttribute={props.state.isAttribute}
                    />
                )}
                {changedFieldsAsStringArray.length === 0 ? null : (
                    <DialogDetailRow detailKey={t("create-profile-dialog.warning")}>
                        <ProfileModificationWarning changedFields={changedFieldsAsStringArray} />
                    </DialogDetailRow>
                )}
            </div>
        </>
    );
};

