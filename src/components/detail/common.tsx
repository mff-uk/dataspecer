import {styled} from "@mui/material/styles";
import {DialogTitle as MuiDialogTitle} from "@mui/material";
import {DialogTitleProps} from "@mui/material/DialogTitle/DialogTitle";
import React from "react";
import {CloseDialogButton} from "./components/close-dialog-button";

const StyledDialogTitle = styled(MuiDialogTitle)(({theme}) => ({
    fontWeight: "normal",
    backgroundColor: theme.palette.action.hover,
}));

export const DialogTitle: React.FC<DialogTitleProps & {close?: () => void}> = (props) => <StyledDialogTitle {...props}>
    {props.children}
    {props.close && <CloseDialogButton onClick={props.close}/>}
</StyledDialogTitle>;
