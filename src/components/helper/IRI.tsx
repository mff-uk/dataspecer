import React, {useCallback} from "react";
import {Button, Typography} from "@material-ui/core";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import {useSnackbar} from "notistack";
import copyToClipboard from "copy-to-clipboard";
import {useTranslation} from "react-i18next";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        link: {
            color: theme.palette.secondary.main
        },
    }),
);

export const IRI: React.FC<{href: string | undefined}> = ({href}) => {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation("ui.iri_copy");
    const { link } = useStyles();

    const copy = useCallback(() => {
        if (href !== undefined) {
            if (copyToClipboard(href)) {
                enqueueSnackbar(t("success"), {variant: "success"});
            } else {
                enqueueSnackbar(t("fail"), {variant: "error"});
            }
        }
    }, [enqueueSnackbar, href, t]);

    return <Typography>
        <a target="_blank" href={href} className={link} rel="noreferrer">{href}</a>
        {" "}
        <Button size="small" onClick={copy} startIcon={<FileCopyIcon />}>{t("text")}</Button>
    </Typography>;
}
