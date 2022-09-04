import {IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

export const CloseDialogButton: React.FC<{onClick: () => void}> = ({ onClick }) =>  {
    return <IconButton
        aria-label="close"
        onClick={onClick}
        sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
        }}
    >
        <CloseIcon/>
    </IconButton>;
}
