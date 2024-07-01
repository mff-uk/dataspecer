import { useBackendConnection } from "../../backend-connection";
import {
    SavePackageAndLeaveButton,
    useUpdatingSavePackageButton,
} from "../../components/management/buttons/save-package-buttons";
import { useModelGraphContext } from "../../context/model-context";
import { useQueryParamsContext } from "../../context/query-params-context";
import { getSvgForCurrentView } from "../../visualization";

const SAVE_PACKAGE = "save package to backend";
const SAVE_PACKAGE_AND_LEAVE = "save package to backend and leave back to manager";
const YOU_NEED_A_PACKAGE_ON_BACKEND =
    "to be able to save to backend, make sure you are in a package. Start with visiting manager/v2";

const MGR_REDIRECT_PATH = process.env.NEXT_PUBLIC_MANAGER_PATH;

export const PackageManagement = () => {
    const { updateSemanticModelPackageModels } = useBackendConnection();
    const { packageId } = useQueryParamsContext();
    const { models, visualModels } = useModelGraphContext();
    const { showMessage, UpdatingSavePackageButton } = useUpdatingSavePackageButton();

    const save = async () => {
        if (!packageId) {
            return;
        }
        const result = await updateSemanticModelPackageModels(packageId, [...models.values()], [...visualModels.values()]);
        const svgResult = await getSvgForCurrentView();
        if (svgResult) {
            const {svg, forModelId} = svgResult;
            const rawSvg = decodeURIComponent(svg.split(",")[1] ?? "");
    
            await fetch((process.env.NEXT_PUBLIC_APP_BACKEND ?? "") + "/resources/blob?iri=" + encodeURIComponent(forModelId) + "&name=svg", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({svg: rawSvg}),
            });
        }

        if (result) {
            showMessage("success");
        } else {
            showMessage("fail");
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

    return (
        <div className="my-auto flex flex-row text-nowrap">
            <UpdatingSavePackageButton
                disabled={!packageId}
                title={packageId ? SAVE_PACKAGE : YOU_NEED_A_PACKAGE_ON_BACKEND}
                onClick={() => void save()}
            />
            <SavePackageAndLeaveButton
                disabled={!packageId}
                title={packageId ? SAVE_PACKAGE_AND_LEAVE : YOU_NEED_A_PACKAGE_ON_BACKEND}
                onClick={() => void handleSavePackageAndLeave()}
            />
        </div>
    );
};
