import { useBackendConnection } from "../../backend-connection";
import {
    SavePackageAndLeaveButton,
    useUpdatingSavePackageButton,
} from "../../components/management/buttons/save-package-buttons";
import { useModelGraphContext } from "../../context/model-context";
import { useQueryParamsContext } from "../../context/query-params-context";

const SAVE_PACKAGE = "save package to backend";
const SAVE_PACKAGE_AND_LEAVE = "save package to backend and leave back to manager";
const YOU_NEED_A_PACKAGE_ON_BACKEND =
    "to be able to save to backend, make sure you are in a package. Start with visiting manager/v2";

const MGR_REDIRECT_PATH = process.env.NEXT_PUBLIC_MANAGER_PATH;

export const PackageManagement = () => {
    const { updateSemanticModelPackageModels } = useBackendConnection();
    // const { packageId } = usePackageSearch();
    const { packageId } = useQueryParamsContext();
    const { models, visualModels } = useModelGraphContext();
    const { showMessage, UpdatingSavePackageButton } = useUpdatingSavePackageButton();

    const handleSavePackage = () => {
        if (!packageId) {
            return;
        }
        updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()])
            .then((didUpdate) => {
                if (didUpdate) {
                    showMessage("success");
                } else {
                    showMessage("fail");
                }
            })
            .catch((err) => console.log("couldn't update packages", err));
    };

    const handleSavePackageAndLeave = () => {
        if (!packageId) {
            return;
        }
        updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()])
            .then(() => {
                if (!MGR_REDIRECT_PATH) {
                    console.error("manager path not set", MGR_REDIRECT_PATH);
                    return;
                }
                const a = document.createElement("a");
                a.setAttribute("href", MGR_REDIRECT_PATH);
                a.click();
            })
            .catch((err) => console.log("couldn't update packages", err));
    };

    return (
        <div className="my-auto flex flex-row text-nowrap">
            <UpdatingSavePackageButton
                disabled={!packageId}
                title={packageId ? SAVE_PACKAGE : YOU_NEED_A_PACKAGE_ON_BACKEND}
                onClick={handleSavePackage}
            />
            <SavePackageAndLeaveButton
                disabled={!packageId}
                title={packageId ? SAVE_PACKAGE_AND_LEAVE : YOU_NEED_A_PACKAGE_ON_BACKEND}
                onClick={handleSavePackageAndLeave}
            />
        </div>
    );
};
