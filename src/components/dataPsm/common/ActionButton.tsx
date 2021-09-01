import React from "react";
import {Button} from "@material-ui/core";
import {useItemStyles} from "../PsmItemCommon";

interface ActionButtonParameters {
    onClick?: () => void;
    icon?: React.ReactElement;
    label?: string;
}

export const ActionButton: React.FC<ActionButtonParameters> = (parameters) => {
    const {actionButton} = useItemStyles();
    return <Button className={actionButton} size="small" onClick={parameters.onClick} startIcon={parameters.icon}>{parameters.label}</Button>
};
