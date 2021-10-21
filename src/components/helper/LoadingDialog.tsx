import React from "react";
import {
    CircularProgress,
    DialogContent
} from "@mui/material";

export const LoadingDialog: React.FC = () => <DialogContent style={{textAlign: "center"}}>
	<CircularProgress style={{margin: "5rem auto"}}/>
</DialogContent>;
