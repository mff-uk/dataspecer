import {
    LanguageString,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState, Dispatch, SetStateAction } from "react";
import { Connection } from "reactflow";
import { AssociationConnectionType, GeneralizationConnectionType } from "../util/edge-connection";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { useBaseDialog } from "./base-dialog";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";
import {
    SemanticModelRelationshipUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getLocalizedStringFromLanguageString } from "../util/language-utils";
import { getRandomName } from "~/app/utils/random-gen";
import { useConfigurationContext } from "../context/configuration-context";
import { IriInput } from "./iri-input";
import { getModelIri } from "../util/model-utils";
import { CardinalityOptions, semanticCardinalityToOption } from "./cardinality-options";
import { getNameLanguageString } from "../util/name-utils";

const AssociationComponent = (props: {
    from: string;
    to: string;
    setAssociation: Dispatch<SetStateAction<Omit<SemanticModelRelationship, "type" | "id" | "iri">>>;
    setAssociationIsProfileOf: Dispatch<SetStateAction<string | null>>;
    disabled: boolean;
}) => {
    const { language: preferredLanguage } = useConfigurationContext();

    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [source, setSource] = useState({
        concept: props.from,
    } as SemanticModelRelationshipEnd);
    const [target, setTarget] = useState({
        concept: props.to,
    } as SemanticModelRelationshipEnd);

    const { relationships: r, profiles: p } = useClassesContext();
    const relationshipsAndProfiles = [
        ...r.filter((v) => !isSemanticModelAttribute(v)),
        ...p
            .filter(isSemanticModelRelationshipUsage)
            .filter((v) => !isSemanticModelAttribute(v as SemanticModelRelationship & SemanticModelRelationshipUsage)),
    ];

    useEffect(() => {
        props.setAssociation({
            name,
            description,
            ends: [source, target],
        });
    }, [name, description, source, target]);

    return (
        <>
            <span className="text-lg font-bold">name:</span>
            <MultiLanguageInputForLanguageString
                ls={name}
                setLs={setName}
                inputType="text"
                defaultLang={preferredLanguage}
                disabled={props.disabled}
            />
            <span className="font-bold">description:</span>
            <MultiLanguageInputForLanguageString
                ls={description}
                setLs={setDescription}
                inputType="textarea"
                defaultLang={preferredLanguage}
                disabled={props.disabled}
            />
            <div className="font-semibold">cardinalities:</div>
            <div>
                <div>
                    cardinality-source:
                    <CardinalityOptions
                        disabled={props.disabled}
                        group="source"
                        defaultCard={semanticCardinalityToOption(source.cardinality ?? null)}
                        setCardinality={setSource}
                    />
                </div>
                <div>
                    cardinality-target:
                    <CardinalityOptions
                        disabled={props.disabled}
                        group="target"
                        defaultCard={semanticCardinalityToOption(target.cardinality ?? null)}
                        setCardinality={setTarget}
                    />
                </div>
            </div>
            <div>is profile of:</div>
            <select
                disabled={props.disabled}
                onChange={(e) => {
                    props.setAssociationIsProfileOf(e.target.value);
                }}
            >
                <option>---</option>
                {relationshipsAndProfiles.map((rp) => {
                    const displayName = getLocalizedStringFromLanguageString(
                        getNameLanguageString(rp),
                        preferredLanguage
                    );
                    return (
                        <option value={rp.id}>
                            {displayName}:{rp.id}
                        </option>
                    );
                })}
            </select>
        </>
    );
};

export const useCreateConnectionDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const createConnectionDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [connectionCreated, setConnectionCreated] = useState(null as unknown as Connection);
    const { createConnection } = useClassesContext();
    const { createRelationshipEntityUsage } = useModelGraphContext();

    useEffect(() => {
        const { current: el } = createConnectionDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setConnectionCreated(null as unknown as Connection);
        // todo: vyres connection mazani stavu // setConn({ connectionType: "association" } as ConnectionType);
        // setCardinality({ source: [0, null], target: [0, null] });
        close();
    };
    const localOpen = (connection: Connection) => {
        setConnectionCreated(connection);
        open();
    };

    const filterInMemoryModels = (models: Map<string, EntityModel>) => {
        return [...models.entries()]
            .filter(([mId, m]) => m instanceof InMemorySemanticModel)
            .map(([mId, m]) => [mId, m.getAlias()]) as [string, string | null][];
    };

    const CreateConnectionDialog = () => {
        if (!connectionCreated) {
            localClose();
            return <></>;
        }
        const { source: sourceId, target: targetId } = connectionCreated;
        if (!sourceId || !targetId) {
            localClose();
            return <></>;
        }
        const { language: preferredLanguage } = useConfigurationContext();
        const { classes2: c, profiles: p } = useClassesContext();
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);

        const source = c.find((cls) => cls.id == sourceId) ?? p.find((prof) => prof.id == sourceId);
        const target = c.find((cls) => cls.id == targetId) ?? p.find((prof) => prof.id == targetId);

        if (!source || !target) {
            alert("couldn't find source or target" + sourceId + " " + targetId);
            localClose();
            return;
        }

        const sourceName = getLocalizedStringFromLanguageString(getNameLanguageString(source), preferredLanguage);
        const targetName = getLocalizedStringFromLanguageString(getNameLanguageString(target), preferredLanguage);

        const [connectionType, setConnectionType] = useState<"association" | "generalization">("association");
        const [activeModel, setActiveModel] = useState(inMemoryModels.at(0)?.at(0) ?? "no in-memory model");

        const modelIri = getModelIri(models.get(activeModel));

        const [association, setAssociation] = useState<Omit<SemanticModelRelationship, "type" | "id" | "iri">>({
            name: {},
            description: {},
            ends: [],
        });
        const [iriHasChanged, setIriHasChanged] = useState(false);
        const [newIri, setNewIri] = useState(getRandomName(7));

        const [associationIsProfileOf, setAssociationIsProfileOf] = useState<string | null>(null);

        return (
            <BaseDialog heading="Create a connection">
                <div>
                    <div className="grid grid-cols-[25%_75%] bg-slate-100 pl-8 pr-16">
                        <label className="font-bold" htmlFor="models">
                            active model:
                        </label>
                        <select
                            name="models"
                            id="models"
                            onChange={(e) => setActiveModel(e.target.value)}
                            defaultValue={activeModel}
                        >
                            {inMemoryModels.map(([mId, mAlias]) => (
                                <option value={mId}>
                                    {mAlias ? mAlias + ":" : null}
                                    {mId}
                                </option>
                            ))}
                        </select>
                        <div className="font-bold">source:</div>
                        <div>
                            {sourceName} -- ({sourceId})
                        </div>
                        <div className="font-bold">target:</div>
                        <div>
                            {targetName} -- ({targetId})
                        </div>
                        <div className="font-bold">relative iri:</div>
                        <div className="flex flex-row">
                            <div className="text-nowrap">{modelIri}</div>
                            <IriInput
                                name={association.name}
                                newIri={newIri}
                                setNewIri={(i) => setNewIri(i)}
                                iriHasChanged={iriHasChanged}
                                onChange={() => setIriHasChanged(true)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-[25%_75%] bg-slate-100 pl-8 pr-16">
                        <div className="font-bold">type:</div>
                        <div>
                            <span
                                onClick={() => {
                                    setConnectionType("association");
                                }}
                                className={connectionType == "association" ? "text-black" : "text-gray-400"}
                            >
                                association
                            </span>
                            |
                            <span
                                onClick={() => setConnectionType("generalization")}
                                className={connectionType == "generalization" ? "text-black" : "text-gray-400"}
                            >
                                generalization
                            </span>
                        </div>
                    </div>
                    <div
                        className={
                            "grid grid-cols-[25%_75%] bg-slate-100 pl-8 pr-16 " +
                            (connectionType == "association" ? "pt-4" : "pointer-events-none pt-4 opacity-30")
                        }
                    >
                        <AssociationComponent
                            from={sourceId}
                            to={targetId}
                            setAssociation={setAssociation}
                            key="sdasd"
                            setAssociationIsProfileOf={setAssociationIsProfileOf}
                            disabled={connectionType != "association"}
                        />
                    </div>
                </div>
                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <button
                        onClick={() => {
                            const saveModel = models.get(activeModel);
                            if (saveModel && saveModel instanceof InMemorySemanticModel) {
                                if (connectionType == "generalization") {
                                    const result = createConnection(saveModel, {
                                        type: "generalization",
                                        child: sourceId,
                                        parent: targetId,
                                        iri: newIri,
                                    } as GeneralizationConnectionType);
                                    console.log("creating generalization ", result, target, source);
                                } else if (connectionType == "association") {
                                    if (associationIsProfileOf) {
                                        createRelationshipEntityUsage(saveModel, "relationship", {
                                            // todo: relationshipusage nema IRI!!!
                                            usageOf: associationIsProfileOf,
                                            name: association.name,
                                            description: association.description,
                                            ends: [
                                                {
                                                    name: association.ends.at(0)?.name ?? null,
                                                    description: association.ends.at(0)?.description ?? null,
                                                    usageNote: {},
                                                    concept: association.ends.at(0)?.concept ?? null,
                                                    cardinality: association.ends.at(0)?.cardinality ?? null,
                                                },
                                                {
                                                    name: association.ends.at(1)?.name ?? null,
                                                    description: association.ends.at(1)?.description ?? null,
                                                    usageNote: {},
                                                    concept: association.ends.at(1)?.concept ?? null,
                                                    cardinality: association.ends.at(1)?.cardinality ?? null,
                                                },
                                            ],
                                        });
                                    } else {
                                        const result = createConnection(saveModel, {
                                            type: "association",
                                            // iri: newIri,
                                            // name: association.name,
                                            description: association.description,
                                            ends: [
                                                {
                                                    concept: association.ends.at(0)?.concept ?? null,
                                                    cardinality: association.ends.at(0)?.cardinality ?? null,
                                                },
                                                {
                                                    name: association.name ?? null,
                                                    description: association.description ?? null,
                                                    concept: association.ends.at(1)?.concept ?? null,
                                                    cardinality: association.ends.at(1)?.cardinality ?? null,
                                                    iri: newIri,
                                                },
                                            ],
                                        } as AssociationConnectionType);
                                        console.log("creating association ", result, target, source);
                                    }
                                }
                                console.log("create-connection-dialog: created successfully(?)");
                            } else {
                                alert(`create-conn-dialog: unknown active model '${activeModel}'`);
                            }

                            close();
                        }}
                    >
                        confirm
                    </button>
                    <button onClick={() => close()}>close</button>
                </div>
            </BaseDialog>
        );
    };

    return {
        isCreateConnectionDialogOpen: isOpen,
        closeCreateConnectionDialog: localClose,
        openCreateConnectionDialog: localOpen,
        CreateConnectionDialog,
    };
};
