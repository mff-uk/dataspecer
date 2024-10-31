import { useBackendConnection } from "../backend-connection";
import { useOptions } from "../application/options";
import { useModelGraphContext } from "../context/model-context";
import { useNotificationServiceWriter } from "../notification";
import { usePackageService } from "../service/package-service-context";
import { getSvgForCurrentView } from "../visualization";
import { getLocalizedStringFromLanguageString } from "../util/language-utils";
import { type Package } from "@dataspecer/core-v2/project";

const MGR_REDIRECT_PATH = import.meta.env.VITE_PUBLIC_MANAGER_PATH;

export interface PackageSectionServiceType {
    packageHasIdentifier: boolean;
    packageLabel: string | null;
    save: () => Promise<void>,
    saveAndClose: () => Promise<void>,
}

export const usePackageSectionService = (): PackageSectionServiceType => {
    const { updateSemanticModelPackageModels } = useBackendConnection();
    const { models, visualModels } = useModelGraphContext();

    const { currentPackage, currentPackageIdentifier } = usePackageService();
    const options = useOptions();
    const notifications = useNotificationServiceWriter();

    const save = async () => {
        if (currentPackageIdentifier === null) {
            return;
        }
        const result = await updateSemanticModelPackageModels(currentPackageIdentifier, [...models.values()], [...visualModels.values()]);
        const svgResult = await getSvgForCurrentView();
        if (svgResult) {
            const { svg, forModelId } = svgResult;
            const rawSvg = decodeURIComponent(svg.split(",")[1] ?? "");
            await fetch((import.meta.env.VITE_PUBLIC_APP_BACKEND ?? "") + "/resources/blob?iri=" + encodeURIComponent(forModelId) + "&name=svg", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ svg: rawSvg }),
            });
        }

        if (result) {
            notifications.success("Package has been saved.");
        } else {
            notifications.success("Can't save the package!");
        }
    };

    const handleSavePackageAndLeave = async () => {
        await save();
        if (!MGR_REDIRECT_PATH) {
            console.error("manager path not set", MGR_REDIRECT_PATH);
            return;
        }
        const a = document.createElement("a");
        a.setAttribute("href", MGR_REDIRECT_PATH);
        a.click();
    };

    const packageLabel = selectPackageName(currentPackage, options.language);

    return {
        packageHasIdentifier: currentPackageIdentifier !== null,
        packageLabel,
        save,
        saveAndClose: handleSavePackageAndLeave,
    };
};

const selectPackageName = (currentPackage: Package | null, language: string): string | null => {
    return getLocalizedStringFromLanguageString(currentPackage?.userMetadata?.label ?? null, language);
};
