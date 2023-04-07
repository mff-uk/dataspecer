import {CardContent as MuiCardContent} from "@mui/material";
import {styled} from "@mui/system";

export const CardContent = styled(MuiCardContent)({'&:last-child': {
        paddingBottom: 16
    }});
