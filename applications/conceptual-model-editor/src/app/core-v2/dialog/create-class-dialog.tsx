import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { useBaseDialog } from "../components/base-dialog";
import { generateName } from "../util/name-utils";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { getModelIri } from "../util/model-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { IriInput, WhitespaceRegExp } from "../components/input/iri-input";
import { filterInMemoryModels } from "../util/utils";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog-colored-model-header";
import { DialogDetailRow } from "../components/dialog-detail-row";

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
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels([...models.values()]);
        const [activeModel, setActiveModel] = useState(model ?? inMemoryModels.at(0));

        const { language: preferredLanguage } = useConfigurationContext();

        const [newName, setNewName] = useState<LanguageString>({ [preferredLanguage]: generateName() });
        const [newDescription, setNewDescription] = useState<LanguageString>({});
        const [iriHasChanged, setIriHasChanged] = useState(false);
        const [newIri, setNewIri] = useState(newName[preferredLanguage]?.toLowerCase().replace(WhitespaceRegExp, "-"));
        const { addClassToModel, aggregatorView } = useModelGraphContext();

        const modelIri = getModelIri(activeModel);

        const handleCreateClass = () => {
            if (!activeModel) {
                alert("active model not set");
                return;
            }
            if (!newIri) {
                alert("iri not set");
                return;
            }

            const { id: clsId } = addClassToModel(activeModel, newName, newIri, newDescription);

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
                            style="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pb-4 pl-8 pr-16 pt-2"
                            activeModel={activeModel?.getId()}
                            onModelSelected={(model) => setActiveModel(inMemoryModels.find((m) => m.getId() == model))}
                        />
                        <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16 pt-2">
                            <DialogDetailRow
                                detailKey="name"
                                detailValue={
                                    <MultiLanguageInputForLanguageString
                                        ls={newName}
                                        setLs={setNewName}
                                        defaultLang={preferredLanguage}
                                        inputType="text"
                                    />
                                }
                                style="text-xl"
                            />
                            <DialogDetailRow
                                detailKey="iri"
                                detailValue={
                                    <IriInput
                                        name={newName}
                                        newIri={newIri}
                                        setNewIri={(i) => setNewIri(i)}
                                        iriHasChanged={iriHasChanged}
                                        onChange={() => setIriHasChanged(true)}
                                        baseIri={modelIri}
                                    />
                                }
                            />
                            <DialogDetailRow
                                detailKey="description"
                                detailValue={
                                    <MultiLanguageInputForLanguageString
                                        ls={newDescription}
                                        setLs={setNewDescription}
                                        defaultLang={preferredLanguage}
                                        inputType="textarea"
                                    />
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-evenly font-semibold">
                    <button onClick={handleCreateClass}>save</button>
                    <button onClick={close}>close</button>
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
