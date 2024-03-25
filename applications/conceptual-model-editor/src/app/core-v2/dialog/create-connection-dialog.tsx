import {
    LanguageString,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
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
import { isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getStringFromLanguageStringInLang } from "../util/language-utils";
import { string } from "zod";

const AssociationComponent = (props: {
    from: string;
    to: string;
    setAssociation: Dispatch<SetStateAction<Omit<SemanticModelRelationship, "type" | "id" | "iri">>>;
    setAssociationIsProfileOf: Dispatch<SetStateAction<string | null>>;
}) => {
    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [source, setSource] = useState({
        concept: props.from,
    } as SemanticModelRelationshipEnd);
    const [target, setTarget] = useState({
        concept: props.to,
    } as SemanticModelRelationshipEnd);

    const { relationships: r, profiles: p } = useClassesContext();
    const relationshipsAndProfiles = [...r, ...p.filter(isSemanticModelRelationshipUsage)];

    useEffect(() => {
        props.setAssociation({
            name,
            description,
            ends: [source, target],
        });
    }, [name, description, source, target]);

    const onCardinalityChange = (cardinalityParam: [number, number | null], what: "source" | "target") => {
        if (what == "source") {
            setSource((prev) => ({ ...prev, cardinality: cardinalityParam }));
        } else if (what == "target") {
            setTarget((prev) => ({ ...prev, cardinality: cardinalityParam }));
        } else {
            alert(`create-connection-dialog: unknown value of what: [${what}]`);
        }
    };

    const isCardinalitySelected = (
        value: [number, number | null] | undefined,
        cardinality: [number, number | null]
    ) => {
        if (!value) {
            return false;
        }
        return value[0] == cardinality[0] && value[1] == cardinality[1];
    };

    const RadioField = (rfProps: { label: string; card: [number, number | null]; what: "source" | "target" }) => (
        <div className="mx-1">
            <input
                type="radio"
                id={`cardinality-${rfProps.what}-${rfProps.label}`}
                name={`cardinality-${rfProps.what}`}
                value={rfProps.label}
                checked={isCardinalitySelected(
                    rfProps.what == "source" ? source.cardinality : target.cardinality,
                    rfProps.card
                )}
                onChange={() => onCardinalityChange(rfProps.card, rfProps.what)}
            />
            <label htmlFor={`cardinality-${rfProps.what}-${rfProps.label}`}>{rfProps.label}</label>
        </div>
    );

    return (
        <div className="grid grid-cols-[20%_80%] bg-slate-50">
            {/* TODO: sanitize */}
            <span className="font-bold">name:</span>
            {/* <input value={name.en!} onChange={(e) => setName({ en: e.target.value })} /> */}
            <MultiLanguageInputForLanguageString ls={name} setLs={setName} inputType="text" defaultLang="en" />
            {/* TODO: sanitize */}
            <span className="font-bold">description:</span>
            {/* <input value={description.en!} onChange={(e) => setDescription({ en: e.target.value })} /> */}
            <MultiLanguageInputForLanguageString
                ls={description}
                setLs={setDescription}
                inputType="textarea"
                defaultLang="en"
            />
            <p>
                cardinality-source:
                <div className="flex flex-row [&]:font-mono">
                    <RadioField label="0..*" what="source" card={[0, null]} />
                    <RadioField label="1..*" what="source" card={[1, null]} />
                    <RadioField label="0..1" what="source" card={[0, 1]} />
                    <RadioField label="1..1" what="source" card={[1, 1]} />
                </div>
            </p>
            <p>
                cardinality-target:
                <div className="flex flex-row [&]:font-mono">
                    <RadioField label="0..*" what="target" card={[0, null]} />
                    <RadioField label="1..*" what="target" card={[1, null]} />
                    <RadioField label="0..1" what="target" card={[0, 1]} />
                    <RadioField label="1..1" what="target" card={[1, 1]} />
                </div>
            </p>
            <div>is profile of:</div>
            <select
                onChange={(e) => {
                    props.setAssociationIsProfileOf(e.target.value);
                }}
            >
                <option>---</option>
                {relationshipsAndProfiles.map((a) => {
                    const name = getStringFromLanguageStringInLang(a.ends.at(1)?.name ?? {})[0] ?? a.id;
                    const descr = getStringFromLanguageStringInLang(a.ends.at(1)?.description ?? {})[0] ?? "";
                    return (
                        <option title={descr} value={a.id}>
                            {name}:{a.id}
                        </option>
                    );
                })}
            </select>
        </div>
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
        return [...models.entries()].filter(([mId, m]) => m instanceof InMemorySemanticModel).map(([mId, _]) => mId);
    };

    const CreateConnectionDialog = () => {
        if (!connectionCreated) {
            localClose();
            return <></>;
        }
        const { source, target } = connectionCreated;
        if (!source || !target) {
            localClose();
            return <></>;
        }
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);

        const [connectionType, setConnectionType] = useState<"association" | "generalization">("association");
        const [activeModel, setActiveModel] = useState(inMemoryModels.at(0) ?? "no in-memory model");
        const [iri, setIri] = useState("https://some.placeholder.com/iri");
        const [association, setAssociation] = useState<Omit<SemanticModelRelationship, "type" | "id" | "iri">>({
            name: {},
            description: {},
            ends: [],
        });
        const [associationIsProfileOf, setAssociationIsProfileOf] = useState<string | null>(null);

        return (
            <BaseDialog heading="Create a connection">
                <div>
                    <div>
                        <h5>Connection</h5>
                        <p>
                            <label className="font-bold" htmlFor="models">
                                active-model:
                            </label>

                            <select
                                name="models"
                                id="models"
                                onChange={(e) => setActiveModel(e.target.value)}
                                defaultValue={activeModel}
                            >
                                {inMemoryModels.map((mId) => (
                                    <option value={mId}>{mId}</option>
                                ))}
                            </select>
                        </p>
                        <p>
                            <span className="font-bold">from:</span> ..{source.substring(15)}
                        </p>
                        <p>
                            <span className="font-bold">to:</span> ..{target.substring(15)}
                        </p>
                        <p className="text-gray-500">
                            <span className="font-bold"> iri:</span>
                            <input value={iri} onChange={(e) => setIri(e.target.value)} />
                        </p>
                    </div>

                    <p>
                        <span className="font-bold">type:</span>
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
                    </p>
                    {connectionType == "association" && (
                        <AssociationComponent
                            from={source}
                            to={target}
                            setAssociation={setAssociation}
                            key="sdasd"
                            setAssociationIsProfileOf={setAssociationIsProfileOf}
                        />
                    )}
                </div>
                <div className="flex flex-row justify-evenly font-bold">
                    <button
                        onClick={() => {
                            const saveModel = models.get(activeModel);
                            if (saveModel && saveModel instanceof InMemorySemanticModel) {
                                if (connectionType == "generalization") {
                                    const result = createConnection(saveModel, {
                                        type: "generalization",
                                        child: source,
                                        parent: target,
                                        iri: iri,
                                    } as GeneralizationConnectionType);
                                    console.log("creating generalization ", result, target, source);
                                } else if (connectionType == "association") {
                                    if (associationIsProfileOf) {
                                        createRelationshipEntityUsage(saveModel, "relationship", {
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
                                            iri,
                                            name: association.name,
                                            description: association.description,
                                            ends: association.ends,
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
