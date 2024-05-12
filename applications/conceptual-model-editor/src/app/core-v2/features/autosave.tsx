import { useEffect, useState } from "react";
import { usePackageSearch } from "../util/package-search";
import { useBackendConnection } from "../backend-connection";
import { ExportButton } from "../components/management/buttons/export-button";
import { useModelGraphContext } from "../context/model-context";

export const useAutoSave = () => {
    const { models, visualModels } = useModelGraphContext();
    const { packageId } = usePackageSearch();
    const { updateSemanticModelPackageModels } = useBackendConnection();
    const [autosaveActive, setAutosaveActive] = useState(false);
    const [autosaveInterval, setAutosaveInterval] = useState<NodeJS.Timeout | null>(null);
    const [autosaveButtonLabel, setAutosaveButtonLabel] = useState("🔴autosave");

    const AUTOSAVE_INTERVAL = parseInt(process.env.NEXT_PUBLIC_APP_AUTOSAVE_INTERVAL_MS ?? "30000") || 30000;

    const getCurrentLabel = () => {
        if (autosaveActive) {
            return "🟢autosave";
        }
        return "🔴autosave";
    };

    useEffect(() => {
        setAutosaveButtonLabel(getCurrentLabel());

        if (!autosaveActive) {
            clearInterval(autosaveInterval!);
            setAutosaveInterval(null);
            return;
        }
        handleAutoSavePackage();
        const res = setInterval(() => {
            handleAutoSavePackage();
        }, AUTOSAVE_INTERVAL);

        setAutosaveInterval(res);
    }, [autosaveActive]);

    const handleAutoSavePackage = async () => {
        if (!packageId) {
            return;
        }
        updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()]);
        showWasAutosaved();
    };

    const showWasAutosaved = () => {
        setAutosaveButtonLabel("...saved 🤞");
        setTimeout(() => {
            setAutosaveButtonLabel(getCurrentLabel());
        }, 750);
    };

    let autosaveButtonTitle: string;
    if (!packageId) {
        autosaveButtonTitle =
            "you can only use autosave to backend when you are inside a package\ngo to /manager and start from there";
    } else if (autosaveActive) {
        autosaveButtonTitle = "autosave: active, stop autosave to backend";
    } else {
        autosaveButtonTitle = "autosave: inactive, start autosave to backend";
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
