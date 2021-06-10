import React from "react";
import {
    CircularProgress,
    DialogContent
} from "@material-ui/core";

export const LoadingDialog: React.FC = () => <DialogContent dividers style={{textAlign: "center"}}>
	<CircularProgress style={{margin: "5rem auto"}}/>
</DialogContent>
