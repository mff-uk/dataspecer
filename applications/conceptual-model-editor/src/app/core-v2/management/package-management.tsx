import { useBackendConnection } from "../backend-connection";
import { usePackageSearch } from "../util/package-search";
import { useModelGraphContext } from "../context/model-context";
import { useRouter } from "next/navigation";

export const PackageManagement = () => {
    const { updateSemanticModelPackageModels } = useBackendConnection();
    const { packageId, setPackage } = usePackageSearch();
    const { models, visualModels } = useModelGraphContext();
    const router = useRouter();

    return (
        <div className="my-auto flex flex-row">
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
            <button
                className="mx-1 bg-green-600 px-1 disabled:opacity-50 disabled:hover:cursor-help"
                disabled={!packageId}
                title={
                    packageId
                        ? "save package to backend and leave back to manager"
                        : "to be able to save to backend, make sure you are in a package. Start with visiting manager/v2"
                }
                onClick={async () => {
                    if (!packageId) {
                        return;
                    }
                    await updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()]);
                    router.push("../manager");
                }}
            >
                💾pkg & 👋
            </button>
        </div>
    );
};
