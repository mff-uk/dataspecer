import React, {memo, useCallback} from "react";
import {Box, Button, Typography} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import {useSnackbar} from "notistack";
import copyToClipboard from "copy-to-clipboard";
import {useTranslation} from "react-i18next";
import {styled} from "@mui/system";

const StyledLink = styled('a')(
    ({ theme }) => ({
        color: theme.palette.text.primary,
        wordBreak: "break-all"
    })
);

export const IRI: React.FC<{href: string | null | undefined, singleLine?: boolean}> = memo(({href, singleLine}) => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation("ui.iri_copy");

    const copy = useCallback(() => {
        if (href) {
            if (copyToClipboard(href)) {
                enqueueSnackbar(t("success"), {variant: "success"});
            } else {
                enqueueSnackbar(t("fail"), {variant: "error"});
            }
        }
    }, [enqueueSnackbar, href, t]);

    if (singleLine) {
        return <Box display="flex" alignItems={"baseline"}>
            <Typography noWrap>
                <StyledLink target="_blank" href={href as string} rel="noreferrer">{href}</StyledLink>
            </Typography>
            <div><Button size="small" onClick={copy} startIcon={<FileCopyIcon />}>{t("text")}</Button></div>
        </Box>;
    } else {
        return <Typography>
            <StyledLink target="_blank" href={href as string} rel="noreferrer">{href}</StyledLink>
            {" "}
            <Button size="small" onClick={copy} startIcon={<FileCopyIcon />}>{t("text")}</Button>
        </Typography>;
    }

});
