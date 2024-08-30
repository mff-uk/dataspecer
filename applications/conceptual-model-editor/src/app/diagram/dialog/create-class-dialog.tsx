import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import type { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import type { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { filterInMemoryModels } from "../util/model-utils";
import { getModelIri } from "../util/iri-utils";
import { useBaseDialog } from "../components/base-dialog";
import { generateName } from "../util/name-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { IriInput } from "../components/input/iri-input";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog/dialog-colored-model-header";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { useClassesContext } from "../context/classes-context";
import { t, logger, configuration } from "../application/";

type CreateClassCallback = (newEntityID: string) => void;

export const useCreateClassDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | undefined>(undefined);
    const [onCreateClassCallback, setOnCreateClassCallback] = useState<CreateClassCallback | null>(null);

    const openDialog = (model?: InMemorySemanticModel, position?: { x: number; y: number }) => {
        setOnCreateClassCallback(null);
        openInternal(model, position);
    };

    const openDialogWithCallback = (onCreateClassCallback: CreateClassCallback, model?: InMemorySemanticModel, position?: { x: number; y: number }) => {
        setOnCreateClassCallback(onCreateClassCallback);
        openInternal(model, position);
    };

    const openInternal = (model?: InMemorySemanticModel, position?: { x: number; y: number }) => {
        setModel(model ?? null);
        setPosition(position);
        open();
    };

    const CreateClassDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();
        const { createAClass } = useClassesContext();
        const { aggregatorView, models } = useModelGraphContext();

        const inMemoryModels = filterInMemoryModels([...models.values()]);
        const [activeModel, setActiveModel] = useState(model ?? inMemoryModels.at(0));

        const [newName, setNewName] = useState<LanguageString>({ [preferredLanguage]: generateName() });
        const [newDescription, setNewDescription] = useState<LanguageString>({});

        const baseIri = getModelIri(activeModel);
        const [newIri, setNewIri] = useState( configuration().nameToClassIri(newName[preferredLanguage] ?? ""));
        const [iriHasChanged, setIriHasChanged] = useState(false);

        const handleCreateClass = () => {
            if (!activeModel) {
                alert(t("create-class-dialog.error.model-not-set"));
                return;
            }
            if (!newIri || newIri == "") {
                alert(t("create-class-dialog.error-iri-not-set"));
                return;
            }
            const newClass = createAClass(activeModel, newName, newIri, newDescription);
            if (newClass.id !== undefined) {
                aggregatorView
                    .getActiveVisualModel()
                    ?.addEntity({ sourceEntityId: newClass.id, position: position ?? undefined });
            } else {
                logger.warn("We have not received the id of newly created class.", newClass);
            }

            close();

            if(onCreateClassCallback !== null) {
                if(newClass.id !== undefined) {
                    onCreateClassCallback(newClass.id);
                }
            }
        };
        return (
            <BaseDialog heading={t("create-class-dialog.create-class")}>
                <div>
                    <div>
                        <DialogColoredModelHeaderWithModelSelector
                            style="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
                            activeModel={activeModel?.getId()}
                            onModelSelected={(model) => setActiveModel(inMemoryModels.find((m) => m.getId() == model))}
                        />
                        <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
                            <DialogDetailRow detailKey={t("create-class-dialog.name")} style="text-xl">
                                <MultiLanguageInputForLanguageString
                                    ls={newName}
                                    setLs={setNewName}
                                    defaultLang={preferredLanguage}
                                    inputType="text"
                                />
                            </DialogDetailRow>
                            <DialogDetailRow detailKey={t("create-class-dialog.iri")}>
                                <IriInput
                                    name={newName}
                                    newIri={newIri}
                                    setNewIri={(iri) => setNewIri(iri)}
                                    iriHasChanged={iriHasChanged}
                                    onChange={() => setIriHasChanged(true)}
                                    baseIri={baseIri}
                                    nameSuggestion={configuration().nameToClassIri}
                                />
                            </DialogDetailRow>
                            <DialogDetailRow detailKey={t("create-class-dialog.description")}>
                                <MultiLanguageInputForLanguageString
                                    ls={newDescription}
                                    setLs={setNewDescription}
                                    defaultLang={preferredLanguage}
                                    inputType="textarea"
                                />
                            </DialogDetailRow>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-evenly font-semibold">
                    <CreateButton onClick={handleCreateClass} />
                    <CancelButton onClick={close} />
                </div>
            </BaseDialog>
        );
    };

    return {
        isCreateClassDialogOpen: isOpen,
        closeCreateClassDialog: close,
        openCreateClassDialog: openDialog,
        openCreateClassDialogWithCallback: openDialogWithCallback,
        CreateClassDialog,
    };
};
