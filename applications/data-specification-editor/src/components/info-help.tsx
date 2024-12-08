import React from "react";
import {IconButton} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {styled} from '@mui/material/styles';
import Tooltip, {tooltipClasses, TooltipProps} from '@mui/material/Tooltip';

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: 11,
    },
}));

/**
 * Shows little info icon with text on hover. Intended to be used next to text content.
 */
export const InfoHelp = (props: {text: string}) => {
    return <LightTooltip
        placement={"top"}
        title={props.text}
    >
        <IconButton size={"small"} sx={{verticalAlign: "top"}}>
            <InfoOutlinedIcon fontSize={"small"} color={"primary"} />
        </IconButton>
    </LightTooltip>
}