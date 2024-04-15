import { useBackendConnection } from "../backend-connection";
import { usePackageSearch } from "../util/package-search";
import { useModelGraphContext } from "../context/model-context";

export const PackageManagement = () => {
    const { updateSemanticModelPackageModels } = useBackendConnection();
    const { packageId, setPackage } = usePackageSearch();
    const { models, visualModels } = useModelGraphContext();

    return (
        <div className="my-auto">
            <button
                className="bg-green-600 px-1 disabled:opacity-50 disabled:hover:cursor-help"
                disabled={!packageId}
                title={
                    packageId
                        ? "save package to backend"
                        : "to be able to save to backend, make sure you are in a package. Start with visiting manager/v2"
                }
                onClick={async () => {
                    if (!packageId) {
                        return;
                    }
                    updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()]);
                }}
            >
                💾pkg
            </button>
        </div>
    );
};
