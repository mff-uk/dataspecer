import { useRef, useEffect, useState, useMemo } from "react";
import { useBaseDialog } from "../components/base-dialog";
import { AddButton } from "../components/dialog/buttons/add-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";
import { logger } from "../application/";

const DEFAULT_IMPORT_URL = "https://www.w3.org/ns/dcat.ttl";

export const useAddModelDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const addModelDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [onSaveCallback, setOnSaveCallback] = useState<null | ((url: string, options: {name: string}) => Promise<void>)>(null);

    useEffect(() => {
        const { current: el } = addModelDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localOpen = (onSaveCallback: (url: string, options: {name: string}) => Promise<void>) => {
        // We store the callback.
        setOnSaveCallback(() => onSaveCallback);
        open();
    };

    const localClose = () => {
        setOnSaveCallback(null);
        close();
    };

    const save = async (url: string, name: string) => {
        await onSaveCallback?.(url, {name});
        localClose();
    };

    const AddModelDialog = () => {
        const [url, setUrl] = useState(DEFAULT_IMPORT_URL);

        const [name, setName] = useState("");
        const [isNameDefault, setIsNameDefault] = useState(true);

        const urlName = useMemo(() => {
            let chunkToParse = url;
            try {
                chunkToParse = (new URL(url)).pathname;
            } catch (error) {}

            return chunkToParse.split("/").pop()?.split(".")[0] ?? "";
        }, [url]);

        const handleAddModels = () => {
            save(url, isNameDefault ? urlName : name).catch((error: unknown) => logger.error("Can't import model.", {url, error}));
        };

        const changeName = (newName: string) => {
            setIsNameDefault(newName === urlName);
            setName(newName);
        };

        return (
            <BaseDialog heading="Add semantic model from a URL">
                <p>
                    Import semantic model using given URL.
                    The URL should resolve to a Turtle file (*.ttl).
                </p>
                <br/>
                <label htmlFor="url">File URL:</label>
                <input
                    name="url"
                    type="text"
                    onChange={(e) => setUrl(e.target.value.trim())}
                    value={url}
                />
                <br/>
                <label htmlFor="name">Imported model name:</label>
                <input
                    name="name"
                    type="text"
                    onChange={(e) => changeName(e.target.value.trim())}
                    value={isNameDefault ? urlName : name}
                />
                <br/>
                <p className="italic">
                    Be warned, that the import is not optimized for large files.
                </p>
                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <AddButton onClick={handleAddModels} />
                    <CancelButton onClick={close} />
                </div>
            </BaseDialog>
        );
    };

    return {
        isAddModelDialogOpen: isOpen,
        closeAddModelDialog: localClose,
        openAddModelDialog: localOpen,
        AddModelDialog,
    };
};
