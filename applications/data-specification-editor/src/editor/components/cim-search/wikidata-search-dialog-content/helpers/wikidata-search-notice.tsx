import React from "react";
import { Box, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";

export interface WikidataSearchNoticeProps {
    isProgress: boolean
    isError?: boolean;
    message?: string;
    height?: number;
}

export const WikidataSearchNotice: React.FC<WikidataSearchNoticeProps> = (props) => {
    return (
        <>
            <Box
                sx={{
                    height: props?.height ?? 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: (theme) => theme.palette.grey[500],
                    flexDirection: "column",
                }}
            >
                {
                    <>
                        {props.isProgress && <CircularProgress color="inherit" style={{ margin: "1rem auto" }} />}
                        {!props.isProgress && props.isError && 
                            <>
                                <SearchOffIcon sx={{ display: "block", height: "4rem", width: "4rem" }} /> 
                                {props?.message ?? ""}
                            </>
                        }
                        {!props.isProgress && !props.isError &&
                            <>
                                <SearchIcon sx={{ display: "block", height: "4rem", width: "4rem" }} />
                                {props?.message ?? ""}
                            </>
                        }
                    </>
                }
            </Box>
        </>
    )
}