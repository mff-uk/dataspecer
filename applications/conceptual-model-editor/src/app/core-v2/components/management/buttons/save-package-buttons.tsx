import { ManagementButton } from "./management-button";

export const SavePackageButton = (props: { disabled?: boolean; title?: string; onClick?: () => void }) => {
    return (
        <ManagementButton color="bg-green-600" {...props} withDisabledHelpCursor={true}>
            💾pkg
        </ManagementButton>
    );
};

export const SavePackageAndLeaveButton = (props: { disabled?: boolean; title?: string; onClick?: () => void }) => {
    return (
        <ManagementButton color="bg-green-600" {...props} withDisabledHelpCursor={true}>
            💾pkg & 👋
        </ManagementButton>
    );
};
