import {styled} from "@mui/material/styles";
import {Button, DialogActions as MuiDialogActions, DialogContent as MuiDialogContent, DialogTitle as MuiDialogTitle} from "@mui/material";
import {DialogTitleProps} from "@mui/material/DialogTitle/DialogTitle";
import React, {ReactNode} from "react";
import {CloseDialogButton} from "./components/close-dialog-button";
import {SaveHandlerContext, useSaveHandlerProvider} from "../helper/save-handler";
import {useTranslation} from "react-i18next";

const StyledDialogTitle = styled(MuiDialogTitle)({
    fontWeight: "normal",
});

export const DialogTitle: React.FC<DialogTitleProps & {close?: () => void}> = ({close, ...props}) => <StyledDialogTitle {...props}>
    {props.children}
    {close && <CloseDialogButton onClick={close}/>}
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

    const {hasUnsavedChanges, saveChanges, saveHandler} = useSaveHandlerProvider();
    return <SaveHandlerContext.Provider value={saveHandler}>
        <DialogTitle close={close} sx={{minHeight: "1.5cm"}}>
            {title}
        </DialogTitle>
        <DialogContent dividers>
            {children}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
                saveChanges().then();
                close();
            }}>{t('ok')}</Button>
            <Button onClick={close}>{t('cancel')}</Button>
            <Button onClick={saveChanges} disabled={!hasUnsavedChanges}>{t('apply')}</Button>
        </DialogActions>
    </SaveHandlerContext.Provider>;
}
