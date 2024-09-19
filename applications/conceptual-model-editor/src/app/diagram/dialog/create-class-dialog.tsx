import { useState } from "react";

import type { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import type { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";

import { useModelGraphContext } from "../context/model-context";
import { MultiLanguageInputForLanguageString } from "../components/input/multi-language-input-4-language-string";
import { getModelIri } from "../util/iri-utils";
import { generateName } from "../util/name-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { IriInput } from "../components/input/iri-input";
import { DialogColoredModelHeaderWithModelSelector } from "../components/dialog/dialog-colored-model-header";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { CreateButton } from "../components/dialog/buttons/create-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { useClassesContext } from "../context/classes-context";
import { t, logger, configuration } from "../application/";
import { ModalDialog } from "./modal-dialog";
import { useNotificationServiceWriter } from "../notification";

interface Point {
    x: number;
    y: number;
}

export interface CreateClassDialogProps {
    isOpen: boolean;
    /**
     * We need to close the dialog.
     */
    close: () => void,
    /**
     * Default model to create the class in.
     */
    model: InMemorySemanticModel | null;
    /**
     * Position where the new class should be inserted at.
     */
    position: Point | null;
}

export const CreateClassDialog = (props: CreateClassDialogProps) => {
    // Just a wrap to make sure we do not render anything when we should not.
    if (props.isOpen === false) {
        return null;
    }
    return <CreateClassDialoginternal {...props} />;
};

const CreateClassDialoginternal = (props: CreateClassDialogProps) => {
    const notifications = useNotificationServiceWriter();
    const { createAClass } = useClassesContext();
    const { language } = useConfigurationContext();
    const { aggregatorView } = useModelGraphContext();

    // State
    const [model, setModel] = useState<InMemorySemanticModel | null>(props.model);
    const [name, setName] = useState<LanguageString>({ [language]: generateName() });
    const [description, setDescription] = useState<LanguageString>({});
    const modelIri = getModelIri(model);
    const [iri, setIri] = useState(configuration().nameToClassIri(name[language] ?? ""));
    const [iriHasChanged, setIriHasChanged] = useState(false);

    const handleCreateClass = () => {
        if (model === null) {
            notifications.error("create-class-dialog.error.model-not-set");
            return;
        }
        if (iri.trim() === "") {
            notifications.error(t("create-class-dialog.error-iri-not-set"));
            return;
        }
        // Create a new class.
        const newClass = createAClass(model, name, iri, description);
        if (newClass.id === undefined) {
            notifications.error("We have not recieved the id of newly created class. See logs for more detail.");
            logger.error("We have not recieved the id of newly created class.", { "class": newClass });
            props.close();
            return;
        }
        // We add the new class to the canvas.
        aggregatorView.getActiveVisualModel()?.addEntity({
            sourceEntityId: newClass.id,
            // TODO Determine default position here!
            position: props.position ?? undefined
        });
        props.close();
    };

    const content = (
        <>
            <DialogColoredModelHeaderWithModelSelector
                style="grid gap-y-2 md:grid-cols-[25%_75%] md:gap-y-3 bg-slate-100 md:pb-4 md:pl-8 md:pr-16 md:pt-2"
                activeModel={model?.getId()}
                onModelSelected={(_, model) => setModel(model)}
            />
            <div className="grid bg-slate-100 md:grid-cols-[25%_75%] md:gap-y-3 md:pl-8 md:pr-16 md:pt-2">
                <DialogDetailRow detailKey={t("create-class-dialog.name")} style="text-xl">
                    <MultiLanguageInputForLanguageString
                        ls={name}
                        setLs={setName}
                        defaultLang={language}
                        inputType="text"
                    />
                </DialogDetailRow>
                <DialogDetailRow detailKey={t("create-class-dialog.iri")}>
                    <IriInput
                        name={name}
                        newIri={iri}
                        setNewIri={(iri) => setIri(iri)}
                        iriHasChanged={iriHasChanged}
                        onChange={() => setIriHasChanged(true)}
                        baseIri={modelIri}
                        nameSuggestion={configuration().nameToClassIri}
                    />
                </DialogDetailRow>
                <DialogDetailRow detailKey={t("create-class-dialog.description")}>
                    <MultiLanguageInputForLanguageString
                        ls={description}
                        setLs={setDescription}
                        defaultLang={language}
                        inputType="textarea"
                    />
                </DialogDetailRow>
            </div>
        </>
    );

    const footer = (
        <>
            <CreateButton onClick={handleCreateClass} />
            <CancelButton onClick={props.close} />
        </>
    );

    return (
        <ModalDialog
            heading={t("create-class-dialog.create-class")}
            isOpen={props.isOpen}
            onCancel={props.close}
            content={content}
            footer={footer}
        />
    );
};

export interface CreateClassDialogContext {
    /**
     * Open the dialog.
     */
    open: (model?: InMemorySemanticModel, position?: Point) => void;
    /**
     * Properties for the CreateClassDialog dialog.
     */
    props: CreateClassDialogProps;
}

/**
 * Context to allow control over the CreateClassDialog.
 */
export const useCreateClassDialog = (): CreateClassDialogContext => {
    const [isOpen, setIsOpen] = useState(false);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);
    const [position, setPosition] = useState<Point | null>(null);

    const open = (model?: InMemorySemanticModel, position?: Point): void => {
        setIsOpen(true);
        setModel(model ?? null);
        setPosition(position ?? null);
    };

    const close = (): void => {
        setIsOpen(false);
    };

    return {
        open,
        props: {
            isOpen,
            close,
            model,
            position
        },
    };
};
