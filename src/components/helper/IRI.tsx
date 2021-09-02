import React, {memo, useCallback} from "react";
import {Box, Button, Typography} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import {useSnackbar} from "notistack";
import copyToClipboard from "copy-to-clipboard";
import {useTranslation} from "react-i18next";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        link: {
            color: theme.palette.secondary.main,
            wordBreak: "break-all",
        },
    }),
);

export const IRI: React.FC<{href: string | null | undefined, singleLine?: boolean}> = memo(({href, singleLine}) => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation("ui.iri_copy");
    const { link } = useStyles();

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
                <a target="_blank" href={href as string} className={link} rel="noreferrer">{href}</a>
            </Typography>
            <div><Button size="small" onClick={copy} startIcon={<FileCopyIcon />}>{t("text")}</Button></div>
        </Box>;
    } else {
        return <Typography>
            <a target="_blank" href={href as string} className={link} rel="noreferrer">{href}</a>
            {" "}
            <Button size="small" onClick={copy} startIcon={<FileCopyIcon />}>{t("text")}</Button>
        </Typography>;
    }

});
