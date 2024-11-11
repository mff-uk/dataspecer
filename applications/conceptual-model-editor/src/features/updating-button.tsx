import { useState } from "react";
import { ManagementButton, type ManagementButtonPropsType } from "../components/management/buttons/management-button";

export const useUpdatingButton = (baseLabel: string, messageInterval: number = 750) => {
    const [currentLabel, setCurrentLabel] = useState(baseLabel);

    const showMessage = (message: string) => {
        setCurrentLabel(`... ${message}`);
        setTimeout(() => {
            setCurrentLabel(baseLabel);
        }, messageInterval);
    };

    const UpdatingButton = (props: ManagementButtonPropsType) => {
        return <ManagementButton {...props}>{currentLabel}</ManagementButton>;
    };

    return {
        showMessage,
        UpdatingButton,
    };
};
