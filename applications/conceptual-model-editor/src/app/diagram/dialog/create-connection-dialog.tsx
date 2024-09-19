import type {
    LanguageString,
    SemanticModelRelationship,
    SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Connection } from "reactflow";
import type { AssociationConnectionType, GeneralizationConnectionType } from "../util/edge-connection";
import { useClassesContext } from "../context/classes-context";
import { useModelGraphContext } from "../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import type { EntityModel } from "@dataspecer/core-v2/entity-model";
import { useBaseDialog } from "../components/base-dialog";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { getRandomName } from "~/app/utils/random-gen";
import { useConfigurationContext } from "../context/configuration-context";
import { IriInput } from "../components/input/iri-input";
import { getModelIri } from "../util/iri-utils";
import { CardinalityOptions } from "../components/cardinality-options";

import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog/dialog-colored-model-header";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";

import { getEntityLabel } from "../service/entity-service";
import { t, logger, configuration } from "../application/";

enum ConnectionType {
    association = "association",
    generalization = "generalization",
}

// TODO: This is not nice but, we can not move the useState outside of
//  the CreateConnectionDialog as it would cause re-creation of the dialog.
//  Instead we use this ugly trick, it would be better to have the CreateConnectionDialog
//  as a separate component.
let openWithConnectionType = ConnectionType.association;

/**
 * This dialog can be used to create an association or a generalization between two entities.
 */
export const useCreateConnectionDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();

    // TODO This code is part of the baseDialog, we should remove it from here.
    const createConnectionDialogRef = useRef(null as unknown as HTMLDialogElement);
    useEffect(() => {
        const { current: el } = createConnectionDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const { createConnection } = useClassesContext();
    const [connectionCreated, setConnectionCreated] = useState(null as unknown as Connection);

    const closeDialog = () => {
        setConnectionCreated(null as unknown as Connection);
        close();
    };

    const openDialog = (connection: Connection) => {
        if (!connection || !(connection.source && connection.target)) {
            alert("Couldn't find source:" + (connection.source ?? "") + ", or target:" + (connection.target ?? ""));
            return;
        }
        setConnectionCreated(connection);
        open();
    };

    const CreateConnectionDialog = () => {
        const [connectionType, setConnectionType] = useState<ConnectionType>(openWithConnectionType);

        const filterInMemoryModels = (models: Map<string, EntityModel>) => {
            return [...models.entries()]
                .filter(([_, m]) => m instanceof InMemorySemanticModel)
                .map(([mId, m]) => [mId, m.getAlias()]) as [string, string | null][];
        };

        const { source: sourceId, target: targetId } = connectionCreated;
        const { language: preferredLanguage } = useConfigurationContext();
        const { classes, profiles } = useClassesContext();
        const { models, aggregatorView } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);
        const [activeModel, setActiveModel] = useState(inMemoryModels.at(0)?.at(0) ?? "no in-memory model");
        const [association, setAssociation] = useState<Omit<SemanticModelRelationship, "type" | "id">>({
            iri: getRandomName(7),
            name: {},
            description: {},
            ends: [],
        });

        const baseIri = getModelIri(models.get(activeModel));

        const source = classes.find((item) => item.id == sourceId) ?? profiles.find((item) => item.id == sourceId);
        const target = classes.find((item) => item.id == targetId) ?? profiles.find((item) => item.id == targetId);

        if (source === undefined || target === undefined) {
            alert("Couldn't find source or target. See logs for more details.");
            logger.error("Couldn't find source or target.", {
                sourceIdentifier: sourceId,
                source,
                targetidentifier: targetId,
                target,
            });
            closeDialog();
            return;
        }

        const handleSaveConnection = () => {
            const modelToSaveTo = models.get(activeModel);
            if (!modelToSaveTo || !(modelToSaveTo instanceof InMemorySemanticModel)) {
                alert(`Can't set to a model. '${activeModel}, ${modelToSaveTo?.getId() ?? ""}'`);
                close();
                return;
            }

            let result: { id?: string; } | null = null;

            switch (connectionType) {
                case ConnectionType.generalization:
                    result = createConnection(modelToSaveTo, {
                        type: "generalization",
                        child: source.id,
                        parent: target.id,
                        // https://github.com/mff-uk/dataspecer/issues/537
                        iri: null,
                    } as GeneralizationConnectionType);
                    break;
                case ConnectionType.association:
                    result = createConnection(modelToSaveTo, {
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
                                iri: association.iri,
                            },
                        ],
                    } as AssociationConnectionType);
                    break;
            }

            if (result !== null && result.id !== null) {
                aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: result.id });
            }

            close();
        };

        return (
            <BaseDialog heading="Create a connection">
                <div>
                    <div className="grid grid-cols-1 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pl-8 md:pr-16 py-2">
                        <DialogDetailRow detailKey={t("create-connection-dialog.type")}>
                            <TypeSwitch
                                value={connectionType}
                                onChange={(next) => {
                                    openWithConnectionType = next;
                                    setConnectionType(next);
                                }}
                            />
                        </DialogDetailRow>
                    </div>

                    <DialogColoredModelHeaderWithModelSelector
                        style={
                            "grid grid-cols-1 px-1 md:grid-cols-[25%_75%] bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
                        }
                        activeModel={activeModel}
                        onModelSelected={(m) => setActiveModel(m)}
                    />

                    <div className="grid grid-cols-1 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pl-8 md:pr-16 gap-y-2">
                        <DialogDetailRow detailKey={t("create-connection-dialog.source")}>
                            <span>
                                {getEntityLabel(source, preferredLanguage)}
                            </span>
                        </DialogDetailRow>
                        <DialogDetailRow detailKey={t("create-connection-dialog.target")}>
                            <span>
                                {getEntityLabel(target, preferredLanguage)}
                            </span>
                        </DialogDetailRow>
                    </div>

                    <div
                        className={
                            "grid grid-cols-1 bg-slate-100 px-1 md:grid-cols-[25%_75%] md:pl-8 md:pr-16 " +
                            (connectionType == "association" ? "pt-4" : "pointer-events-none pt-4 opacity-30")
                        }
                    >
                        <Association
                            from={source.id}
                            to={target.id}
                            setAssociation={setAssociation}
                            key="association-component-create-connection"
                            disabled={connectionType !== ConnectionType.association}
                            baseIri={baseIri}
                            language={preferredLanguage}
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
        closeCreateConnectionDialog: closeDialog,
        openCreateConnectionDialog: openDialog,
        CreateConnectionDialog,
    };
};

/**
 * Swith between generalization and relationship.
 */
const TypeSwitch = (props: {
    value: ConnectionType;
    onChange: (value: ConnectionType) => void;
    disabled?: boolean;
}) => {
    const { value, onChange, disabled } = props;
    const isAssociation = value === ConnectionType.association;
    const isGeneralization = !isAssociation;

    return (
        <div>
            <button
                className={isAssociation ? "font-bold text-blue-800" : ""}
                disabled={disabled || isAssociation}
                onClick={() => onChange(ConnectionType.association)}
            >
                Relationship
            </button>

            <span className="mx-2">|</span>

            <button
                className={isGeneralization ? "font-bold text-blue-800" : ""}
                disabled={disabled || isGeneralization}
                onClick={() => onChange(ConnectionType.generalization)}
            >
                Generalization
            </button>
        </div>
    );
};

/**
 * Contains fields relevant only for association.
 */
const Association = (props: {
    from: string;
    to: string;
    setAssociation: Dispatch<SetStateAction<Omit<SemanticModelRelationship, "type" | "id">>>;
    disabled: boolean;
    baseIri: string;
    language: string;
}) => {
    const { language, disabled, setAssociation } = props;

    const [iri, setIri] = useState(getRandomName(7));
    const [iriHasChanged, setIriHasChanged] = useState(false);

    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [source, setSource] = useState({
        concept: props.from,
    } as SemanticModelRelationshipEnd);
    const [target, setTarget] = useState({
        concept: props.to,
    } as SemanticModelRelationshipEnd);

    useEffect(() => {
        setAssociation({
            iri,
            name,
            description,
            ends: [source, target],
        });
    }, [iri, name, description, source, target, setAssociation]);

    return (
        <>
            <DialogDetailRow detailKey={t("create-connection-dialog.name")}>
                <MultiLanguageInputForLanguageString
                    ls={name}
                    setLs={setName}
                    inputType="text"
                    defaultLang={language}
                    disabled={disabled}
                />
            </DialogDetailRow>
            <DialogDetailRow detailKey={t("create-connection-dialog.iri")}>
                <IriInput
                    name={name}
                    newIri={iri}
                    setNewIri={(i) => setIri(i)}
                    iriHasChanged={iriHasChanged}
                    onChange={() => setIriHasChanged(true)}
                    baseIri={props.baseIri}
                    nameSuggestion={configuration().nameToIri}
                    disabled={disabled}
                />
            </DialogDetailRow>
            <DialogDetailRow detailKey={t("create-connection-dialog.description")}>
                <MultiLanguageInputForLanguageString
                    ls={description}
                    setLs={setDescription}
                    inputType="textarea"
                    defaultLang={language}
                    disabled={disabled}
                />
            </DialogDetailRow>

            {/* We hide cardinality for associations. */}
            {configuration().hideRelationCardinality ? null :
                <DialogDetailRow detailKey={t("create-connection-dialog.cardinality")}>
                    <div>
                        <div>
                            {t("create-connection-dialog.source")}:
                            <CardinalityOptions
                                disabled={disabled}
                                group="source"
                                defaultCard={source.cardinality}
                                setCardinality={setSource}
                            />
                        </div>
                        <div>
                            {t("create-connection-dialog.target")}:
                            <CardinalityOptions
                                disabled={disabled}
                                group="target"
                                defaultCard={target.cardinality}
                                setCardinality={setTarget}
                            />
                        </div>
                    </div>
                </DialogDetailRow>
            }
        </>
    );
};
