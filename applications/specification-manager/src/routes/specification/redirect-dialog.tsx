import {Dialog, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import React from "react";

export const RedirectDialog: React.FC<{isOpen: boolean}> = ({isOpen}) =>
    <Dialog
        open={isOpen}
    >
        <DialogTitle id="alert-dialog-title">
            You are being redirected
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                Please wait while you being redirected to the modelling application.
            </DialogContentText>
        </DialogContent>
    </Dialog>
