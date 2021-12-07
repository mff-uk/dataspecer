import {styled} from "@mui/material/styles";
import {Button, DialogActions as MuiDialogActions, DialogContent as MuiDialogContent, DialogTitle as MuiDialogTitle} from "@mui/material";
import {DialogTitleProps} from "@mui/material/DialogTitle/DialogTitle";
import React, {ReactNode} from "react";
import {CloseDialogButton} from "./components/close-dialog-button";
import {DialogSaveStatusContext, useDialogSaveStatusProvider} from "./dialog-save";
import {useTranslation} from "react-i18next";

const StyledDialogTitle = styled(MuiDialogTitle)({
    fontWeight: "normal",
});


export const DialogTitle: React.FC<DialogTitleProps & {close?: () => void}> = (props) => <StyledDialogTitle {...props}>
    {props.children}
    {props.close && <CloseDialogButton onClick={props.close}/>}
</StyledDialogTitle>;

export const DialogContent = styled(MuiDialogContent)(({theme}) => ({
    backgroundColor: theme.palette.action.hover,
}));

export const DialogActions = MuiDialogActions;

export const DialogWrapper: React.FC<{
    title: ReactNode,
    children: ReactNode,
    close: () => void,
}> = ({title, children, close}) => {
    const {t} = useTranslation("detail");

    const {hasUnsavedChanges, saveChanges, dialogSaveStatusContext} = useDialogSaveStatusProvider();
    return <DialogSaveStatusContext.Provider value={dialogSaveStatusContext}>
        <DialogTitle close={close}>
            {title}
        </DialogTitle>
        <DialogContent dividers>
            {children}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
                saveChanges();
                close();
            }}>{t('ok')}</Button>
            <Button onClick={close}>{t('cancel')}</Button>
            <Button onClick={saveChanges} disabled={!hasUnsavedChanges}>{t('apply')}</Button>
        </DialogActions>
    </DialogSaveStatusContext.Provider>;
}
