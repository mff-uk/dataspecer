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
                className="bg-green-600 px-1"
                disabled={!packageId}
                title="save package to backend"
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
