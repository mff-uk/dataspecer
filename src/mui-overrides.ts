import {CardContent as MuiCardContent} from "@mui/material";
import {styled} from "@mui/styles";

export const CardContent = styled(MuiCardContent)({'&:last-child': {
        paddingBottom: 16
    }});
