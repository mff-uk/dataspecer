import { Typography, Tooltip, IconButton, Box, Slider } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useTranslation } from "react-i18next";

export interface WikidataSearchBoostSliderProps {
    infoText: string,
    tooltipText: string,
    onChange: (value: number) => void;
}

export const WikidataSearchBoostSlider: React.FC<WikidataSearchBoostSliderProps> = ({infoText, tooltipText, onChange}) => {
    const {t} = useTranslation("search-dialog");
    return (
        <>
            <Typography sx={{marginTop: 1}} fontSize={18}>{infoText}:
                <Tooltip title={tooltipText + t("wikidata.boost common tooltip")}>
                    <IconButton size="small">
                        <HelpOutlineIcon />
                    </IconButton>
                </Tooltip>
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" marginTop={2}>
                <Typography fontSize={15}>{t("wikidata.no boost")}</Typography>
                <Slider 
                    color="info"
                    sx={{width: 190, marginLeft: 2}} 
                    defaultValue={0} 
                    valueLabelFormat={(value: number) => `${value * 100} %`}
                    step={0.1} 
                    min={0} 
                    max={0.9}
                    marks
                    valueLabelDisplay="auto"
                    onChange={(event: Event, newValue: number | number[]) => {
                        if (typeof newValue === "number")
                            onChange(newValue);      
                    }}
                />
                <Typography marginLeft={2} fontSize={15}>{t("wikidata.max boost")}</Typography>
            </Box>
        </>
    )

}