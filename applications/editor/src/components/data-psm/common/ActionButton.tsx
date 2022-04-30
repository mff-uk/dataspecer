import React from "react";
import {MenuItem} from "@mui/material";

interface ActionButtonParameters {
    onClick?: () => void;
    icon?: React.ReactElement;
    label?: string;
}

export const ActionButton: React.FC<ActionButtonParameters> = (parameters) => {
    return <MenuItem onClick={parameters.onClick} title={parameters.label}>{parameters.icon}</MenuItem>
};
