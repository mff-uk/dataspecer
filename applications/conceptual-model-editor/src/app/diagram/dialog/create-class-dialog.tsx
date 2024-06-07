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
import { IriInput, WhitespaceRegExp } from "../components/input/iri-input";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog/dialog-colored-model-header";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { useClassesContext } from "../context/classes-context";

export const useCreateClassDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);
    const [position, setPosition] = useState<{ x: number; y: number } | undefined>(undefined);

    const localOpen = (model?: InMemorySemanticModel, position?: { x: number; y: number }) => {
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
        const [iriHasChanged, setIriHasChanged] = useState(false);
        const [newIri, setNewIri] = useState(newName[preferredLanguage]?.toLowerCase().replace(WhitespaceRegExp, "-"));

        const modelIri = getModelIri(activeModel);

        const handleCreateClass = () => {
            if (!activeModel) {
                alert("active model not set");
                return;
            }
            if (!newIri || newIri == "") {
                alert("iri not set");
                return;
            }

            const { id: clsId } = createAClass(activeModel, newName, newIri, newDescription); // addClassToModel(activeModel, newName, newIri, newDescription);

            if (clsId) {
                aggregatorView
                    .getActiveVisualModel()
                    ?.addEntity({ sourceEntityId: clsId, position: position ?? undefined });
            }
            close();
        };

        return (
            <BaseDialog heading="Creating an entity">
                <div>
                    <div>
                        <DialogColoredModelHeaderWithModelSelector
                            style="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
                            activeModel={activeModel?.getId()}
                            onModelSelected={(model) => setActiveModel(inMemoryModels.find((m) => m.getId() == model))}
                        />
                        <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
                            <DialogDetailRow detailKey="name" style="text-xl">
                                <MultiLanguageInputForLanguageString
                                    ls={newName}
                                    setLs={setNewName}
                                    defaultLang={preferredLanguage}
                                    inputType="text"
                                />
                            </DialogDetailRow>
                            <DialogDetailRow detailKey="iri">
                                <IriInput
                                    name={newName}
                                    newIri={newIri}
                                    setNewIri={(i) => setNewIri(i)}
                                    iriHasChanged={iriHasChanged}
                                    onChange={() => setIriHasChanged(true)}
                                    baseIri={modelIri}
                                />
                            </DialogDetailRow>
                            <DialogDetailRow detailKey="description">
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
        openCreateClassDialog: localOpen,
        CreateClassDialog,
    };
};