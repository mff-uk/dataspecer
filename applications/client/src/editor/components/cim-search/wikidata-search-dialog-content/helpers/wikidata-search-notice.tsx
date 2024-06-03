import React from "react";
import { Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";

export interface WikidataSearchNoticeProps {
    isError: boolean;
    message: string;
}

export const WikidataSearchNotice: React.FC<WikidataSearchNoticeProps> = (props) => {
    return (
        <>
            <Box
                sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: (theme) => theme.palette.grey[500],
                    flexDirection: "column",
                }}
            >
                {
                    <>
                        {
                            props.isError 
                            ?
                            <SearchOffIcon sx={{ display: "block", height: "4rem", width: "4rem" }} /> 
                            :
                            <SearchIcon sx={{ display: "block", height: "4rem", width: "4rem" }} />
                        }
                        {props.message}
                    </>
                }
            </Box>
        </>
    )
}