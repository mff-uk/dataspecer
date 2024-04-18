
import React from "react";
import {Box, DialogContent} from "@mui/material";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useTranslation } from "react-i18next";

export const LoadingError: React.FC = () => {
    const {t, i18n} = useTranslation("interpretedSurrounding");

    return (
    <DialogContent style={{textAlign: "center"}}>
        <Box 
            sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: (theme) => theme.palette.grey[500],
                flexDirection: "column",
            }}>
            {<><SearchOffIcon sx={{display: "block", height: "4rem", width: "4rem"}} />{t('no ancestors no associations')}</>}
        </Box>
    </DialogContent>
    );
}