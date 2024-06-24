import React from "react";
import { Box, DialogContent } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";

export interface LoadingErrorProperties {
    errorMessage: string;
}

export const WikidataLoadingError: React.FC<LoadingErrorProperties> = ({ errorMessage }) => {
    return (
        <DialogContent style={{ textAlign: "center" }}>
            <Box
                sx={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: (theme) => theme.palette.grey[500],
                    flexDirection: "column",
                }}
            >
                {
                    <>
                        <SearchOffIcon sx={{ display: "block", height: "4rem", width: "4rem" }} />
                        {errorMessage}
                    </>
                }
            </Box>
        </DialogContent>
    );
};
