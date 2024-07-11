import { useUpdatingButton } from "../../../features/updating-button";
import { ManagementButton, type ManagementButtonPropsType } from "./management-button";

export const useUpdatingSavePackageButton = () => {
    const { UpdatingButton, showMessage } = useUpdatingButton("💾save");

    const UpdatingSavePackageButton = (props: ManagementButtonPropsType) => {
        return <UpdatingButton {...props} color="bg-green-600" withDisabledHelpCursor={true} />;
    };

    return {
        UpdatingSavePackageButton,
        showMessage,
    };
};

export const SavePackageButton = (props: { disabled?: boolean; title?: string; onClick?: () => void }) => {
    return (
        <ManagementButton color="bg-green-600" {...props} withDisabledHelpCursor={true}>
            💾save
        </ManagementButton>
    );
};

export const SavePackageAndLeaveButton = (props: { disabled?: boolean; title?: string; onClick?: () => void }) => {
    return (
        <ManagementButton color="bg-green-600" {...props} withDisabledHelpCursor={true}>
            💾save & 👋leave
        </ManagementButton>
    );
};
