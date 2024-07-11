import { useEffect, useState } from "react";
import { useBackendConnection } from "../backend-connection";
import { ExportButton } from "../components/management/buttons/export-button";
import { useModelGraphContext } from "../context/model-context";
import { useQueryParamsContext } from "../context/query-params-context";

const AUTOSAVE_INTERVAL = parseInt(process.env.NEXT_PUBLIC_APP_AUTOSAVE_INTERVAL_MS ?? "30000") || 30000;

const AUTOSAVE_ENABLED_BY_DEFAULT = process.env.NEXT_PUBLIC_APP_AUTOSAVE_ENABLED_BY_DEFAULT === "1";

export const useAutoSave = () => {
    const { models, visualModels } = useModelGraphContext();
    const { packageId } = useQueryParamsContext();

    const { updateSemanticModelPackageModels } = useBackendConnection();
    const [autosaveActive, setAutosaveActive] = useState(AUTOSAVE_ENABLED_BY_DEFAULT);
    const [autosaveInterval, setAutosaveInterval] = useState<NodeJS.Timeout | null>(null);
    const [autosaveButtonLabel, setAutosaveButtonLabel] = useState(getAutosaveLabel(AUTOSAVE_ENABLED_BY_DEFAULT));

    useEffect(() => {
        setAutosaveButtonLabel(getAutosaveLabel(autosaveActive));

        if (!autosaveActive) {
            clearInterval(autosaveInterval ?? undefined);
            setAutosaveInterval(null);
            return;
        }
        handleAutoSavePackage();

        const timeout = setInterval(() => handleAutoSavePackage(), AUTOSAVE_INTERVAL);
        setAutosaveInterval(timeout);

        // We can not list all properties as this would cycle.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autosaveActive]);

    const handleAutoSavePackage = () => {
        if (!packageId) {
            return;
        }
        updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()])
            .then((status) => {
                showWasAutosaved(status ? "success" : "fail");
            })
            .catch(console.log);
    };

    const showWasAutosaved = (result: "success" | "fail" = "success") => {
        setAutosaveButtonLabel(`... ${result}`);
        setTimeout(() => {
            setAutosaveButtonLabel(getAutosaveLabel(autosaveActive));
        }, 750);
    };

    let autosaveButtonTitle: string;
    if (!packageId) {
        autosaveButtonTitle =
            "you can only use autosave when you are inside a package\ngo to /manager and start from there";
    } else if (autosaveActive) {
        autosaveButtonTitle = "autosave: active, stop autosave";
    } else {
        autosaveButtonTitle = "autosave: inactive, start autosave";
    }

    const AutoSaveButton = () => {
        return (
            <ExportButton
                title={autosaveButtonTitle}
                onClick={() => setAutosaveActive((prev) => !prev)}
                disabled={!packageId}
                withDisabledHelpCursor={true}
            >
                {autosaveButtonLabel}
            </ExportButton>
        );
    };

    return {
        isAutoSaveActive: autosaveActive,
        AutoSaveButton,
    };
};

const getAutosaveLabel = (active: boolean) => {
    if (active) {
        return "🟢autosave";
    }
    return "🔴autosave";
};

