import React from "react";
import {Box, Dialog, DialogContent, DialogTitle, IconButton, Typography} from "@material-ui/core";
import {PimClass, SlovnikPimMetadata, Store} from "model-driven-data";
import {useTranslation} from "react-i18next";
import CloseIcon from '@material-ui/icons/Close';
import {LanguageStringFallback} from "../helper/LanguageStringComponents";
import {GlossaryNote} from "../slovnik.gov.cz/GlossaryNote";
import {IRI} from "../helper/IRI";

interface Parameters {
    store: Store,
    cls: PimClass | null,

    isOpen: boolean,
    close: () => void,
}

export const PimClassDetailDialog: React.FC<Parameters> = ({isOpen, close, cls}) => {
    const {t} = useTranslation("psmDetail");

    return <Dialog onClose={close} open={isOpen} maxWidth={"sm"} fullWidth>
        <DialogTitle disableTypography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant={"h5"}><small>{t("class.title text")}:</small> <LanguageStringFallback
                    from={cls?.pimHumanLabel}
                    fallback={<em>Unnamed</em>}
                >
                    {text => <strong>{text}</strong>}
                </LanguageStringFallback>
                    {" "}
                    <GlossaryNote entity={cls as SlovnikPimMetadata} />
                </Typography>

                <IconButton aria-label="close" onClick={close}>
                    <CloseIcon />
                </IconButton>
            </Box>

        </DialogTitle>
        <DialogContent>
            <Typography color="textSecondary"><LanguageStringFallback from={cls?.pimHumanDescription} fallback={<em>{t("no description")}</em>}>{text => <>{text}</>}</LanguageStringFallback></Typography>
        </DialogContent>
        <DialogContent>
            <IRI href={cls?.pimInterpretation} />
        </DialogContent>
    </Dialog>
}
