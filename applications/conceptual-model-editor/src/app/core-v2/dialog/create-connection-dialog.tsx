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
import { useBaseDialog } from "../components/base-dialog";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { getRandomName } from "~/app/utils/random-gen";
import { useConfigurationContext } from "../context/configuration-context";
import { IriInput } from "../components/input/iri-input";
import { getModelIri } from "../util/iri-utils";
import { CardinalityOptions } from "../components/cardinality-options";

import { EntityProxy } from "../util/detail-utils";
import { DialogDetailRow2 } from "../components/dialog/dialog-detail-row";
import { TwoWaySwitch } from "../components/input/two-way-switch";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog/dialog-colored-model-header";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";

const AssociationComponent = (props: {
    from: string;
    to: string;
    setAssociation: Dispatch<SetStateAction<Omit<SemanticModelRelationship, "type" | "id" | "iri">>>;
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

    useEffect(() => {
        props.setAssociation({
            name,
            description,
            ends: [source, target],
        });
    }, [name, description, source, target]);

    return (
        <>
            <DialogDetailRow2 detailKey="name">
                <MultiLanguageInputForLanguageString
                    ls={name}
                    setLs={setName}
                    inputType="text"
                    defaultLang={preferredLanguage}
                    disabled={props.disabled}
                />
            </DialogDetailRow2>
            <DialogDetailRow2 detailKey="description">
                <MultiLanguageInputForLanguageString
                    ls={description}
                    setLs={setDescription}
                    inputType="textarea"
                    defaultLang={preferredLanguage}
                    disabled={props.disabled}
                />
            </DialogDetailRow2>
            <DialogDetailRow2 detailKey="cardinalities">
                <div>
                    <div>
                        cardinality-source:
                        <CardinalityOptions
                            disabled={props.disabled}
                            group="source"
                            defaultCard={source.cardinality}
                            setCardinality={setSource}
                        />
                    </div>
                    <div>
                        cardinality-target:
                        <CardinalityOptions
                            disabled={props.disabled}
                            group="target"
                            defaultCard={target.cardinality}
                            setCardinality={setTarget}
                        />
                    </div>
                </div>
            </DialogDetailRow2>
        </>
    );
};

export const useCreateConnectionDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const createConnectionDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [connectionCreated, setConnectionCreated] = useState(null as unknown as Connection);
    const { createConnection } = useClassesContext();

    useEffect(() => {
        const { current: el } = createConnectionDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setConnectionCreated(null as unknown as Connection);
        close();
    };
    const localOpen = (connection: Connection) => {
        setConnectionCreated(connection);
        open();
    };

    const filterInMemoryModels = (models: Map<string, EntityModel>) => {
        return [...models.entries()]
            .filter(([_, m]) => m instanceof InMemorySemanticModel)
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
        const { models, aggregatorView } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);

        const source = c.find((cls) => cls.id == sourceId) ?? p.find((prof) => prof.id == sourceId);
        const target = c.find((cls) => cls.id == targetId) ?? p.find((prof) => prof.id == targetId);

        if (!source || !target) {
            alert("couldn't find source or target" + sourceId + " " + targetId);
            localClose();
            return;
        }

        const sourceName = EntityProxy(source, preferredLanguage).name;
        const targetName = EntityProxy(target, preferredLanguage).name;

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

        const handleSaveConnection = () => {
            const saveModel = models.get(activeModel);
            if (!saveModel || !(saveModel instanceof InMemorySemanticModel)) {
                alert(`create-conn-dialog: unknown active model '${activeModel}, ${saveModel?.getId()}'`);
                close();
                return;
            }

            let result:
                | {
                      success: boolean;
                      id?: undefined;
                  }
                | {
                      success: true;
                      id: string;
                  }
                | null = null;
            if (connectionType == "generalization") {
                result = createConnection(saveModel, {
                    type: "generalization",
                    child: sourceId,
                    parent: targetId,
                    iri: newIri,
                } as GeneralizationConnectionType);
                console.log("creating generalization ", result, target, source);
            } else if (connectionType == "association") {
                result = createConnection(saveModel, {
                    type: "association",
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

            if (result && result.id) {
                aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: result.id });
            }

            console.log("create-connection-dialog: created successfully(?)", result);
            close();
        };

        return (
            <BaseDialog heading="Create a connection">
                <div>
                    <DialogColoredModelHeaderWithModelSelector
                        style={"grid grid-cols-[25%_75%] bg-slate-100 pb-4 pl-8 pr-16 pt-2"}
                        activeModel={activeModel}
                        onModelSelected={(m) => setActiveModel(m)}
                    />
                    <div className="grid grid-cols-[25%_75%] bg-slate-100 pl-8 pr-16">
                        <DialogDetailRow2 detailKey="source">
                            <span>
                                {sourceName} -- ({sourceId})
                            </span>
                        </DialogDetailRow2>
                        <DialogDetailRow2 detailKey="target">
                            <span>
                                {targetName} -- ({targetId})
                            </span>
                        </DialogDetailRow2>
                        <DialogDetailRow2 detailKey="iri">
                            <IriInput
                                name={association.name}
                                newIri={newIri}
                                setNewIri={(i) => setNewIri(i)}
                                iriHasChanged={iriHasChanged}
                                onChange={() => setIriHasChanged(true)}
                                baseIri={modelIri}
                            />
                        </DialogDetailRow2>
                    </div>

                    <div className="grid grid-cols-[25%_75%] bg-slate-100 pl-8 pr-16">
                        <DialogDetailRow2 detailKey="type">
                            <TwoWaySwitch
                                choices={["association", "generalization"]}
                                selected={connectionType}
                                onChoiceSelected={(c) => setConnectionType(c as typeof connectionType)}
                            />
                        </DialogDetailRow2>
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
                            key="association-component-create-connection"
                            disabled={connectionType != "association"}
                        />
                    </div>
                </div>

                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <CreateButton onClick={handleSaveConnection} />
                    <CancelButton onClick={close} />
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
