import React from "react";
import { Box, CircularProgress, DialogContent } from "@mui/material";

export const WikidataLoading: React.FC = () => {
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
                <CircularProgress style={{ margin: "5rem auto" }} />
            </Box>
        </DialogContent>
    );
};
