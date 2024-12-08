import {Button, ButtonGroup} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, {memo} from "react";
import CloseIcon from '@mui/icons-material/Close';
import Grow from '@mui/material/Grow';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {useTranslation} from "react-i18next";
import {usePreviousValue} from "../../utils/hooks/use-previous-value";
import {RETURN_BACK_URL_KEY, RETURN_BACK_URL_NAME_KEY} from "./init";
import {useSessionStorage} from "usehooks-ts";

const ButtonMenuTheme = createTheme({
    palette: {
        primary: {
            "main": "#fff",
            "contrastText": "rgba(0, 0, 0, 0.87)"
        },
    },
});

/**
 * If URL search params contain `returnUrl` then a button is rendered that redirects to that URL.
 *
 * Intended to be used in the top bar of the application.
 */
export const ReturnBackButton = memo(() => {
    // ?returnUrl=https://google.com&returnUrlName=Google
    const [returnUrl, setReturnUrl] = useSessionStorage(RETURN_BACK_URL_KEY, null);
    const active = returnUrl !== null;
    const [toolName, setToolName] = useSessionStorage<string | null>(RETURN_BACK_URL_NAME_KEY, null);
    const toolNameAnimationAware = usePreviousValue(active, toolName);

    const {t} = useTranslation('ui');

    const unsetReturnUrlData = () => {
        setReturnUrl(null);
        setToolName(null);
    };

    return <ThemeProvider theme={ButtonMenuTheme}>
        <Grow in={active} mountOnEnter unmountOnExit appear={false}>
            <ButtonGroup sx={{mx: 3}} variant="contained">
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => window.location.href = returnUrl}
                >
                    {toolNameAnimationAware ? t("return back button", {toolName: toolNameAnimationAware}) : t("return back button unnamed tool")}
                </Button>
                <Button
                    size="small"
                    onClick={unsetReturnUrlData}
                >
                    <CloseIcon />
                </Button>
            </ButtonGroup>
        </Grow>
    </ThemeProvider>
});
