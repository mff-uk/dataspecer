import {PimAttribute, PsmAttribute, Store} from "model-driven-data";
import React, {useCallback, useMemo, useState} from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography
} from "@material-ui/core";
import {LabelAndDescriptionLanguageStrings, LabelDescriptionEditor} from "./LabelDescriptionEditor";
import {useToggle} from "../../hooks/useToggle";
import {StoreContext} from "../App";
import {useTranslation} from "react-i18next";
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import {LanguageStringFallback} from "../helper/LanguageStringComponents";

interface Parameters {
    store: Store,
    attribute: PsmAttribute | null,

    isOpen: boolean,
    close: () => void,

    updateTechnicalLabel: (attribute: PsmAttribute, label: string) => void,
}

export const AttributeDetailDialog: React.FC<Parameters> = ({store, attribute, isOpen, close, updateTechnicalLabel}) => {
    const {psmUpdateHumanLabelAndDescription, psmModifyAttribute} = React.useContext(StoreContext);
    const [technicalLabel, setTechnicalLabel] = useState<string>(attribute?.psmTechnicalLabel || "");
    // @ts-ignore
    const [dataType, setDataType] = useState<string>(attribute?.type || "");
    const {t} = useTranslation("psmAttribute-dialog");

    const interpretation = attribute?.psmInterpretation ? store[attribute?.psmInterpretation] as PimAttribute : null;

    const psmLabelDialog = useToggle();
    const psmLabelsData: LabelAndDescriptionLanguageStrings = useMemo(() => {
        return {
            label: attribute?.psmHumanLabel ?? {},
            description: attribute?.psmHumanDescription ?? {},
        }
    }, [attribute?.psmHumanLabel, attribute?.psmHumanDescription]);
    const psmUpdateLabels = useCallback((data: LabelAndDescriptionLanguageStrings) => attribute ? psmUpdateHumanLabelAndDescription(attribute, data) : null, [attribute, psmUpdateHumanLabelAndDescription]);


    const save = () => {
        if (!attribute) {
            return;
        }
        psmModifyAttribute(attribute, technicalLabel, dataType);
        close();
    };

    // @ts-ignore
    window.sss = save;

    return <Dialog onClose={close} open={isOpen} maxWidth={"sm"} fullWidth>
        <DialogTitle id="customized-dialog-title">
            {t("title")}
        </DialogTitle>
        <DialogContent>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <TextField
                        id="outlined-helperText"
                        label={t("technical label.label")}
                        value={technicalLabel}
                        onChange={event => setTechnicalLabel(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                save();
                            }
                        }}
                        autoFocus
                        fullWidth
                        placeholder={t("technical label.placeholder")}
                        variant={"filled"}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        id="outlined-helperText"
                        label={t("data type.label")}
                        value={dataType}
                        onChange={event => setDataType(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                save();
                            }
                        }}
                        fullWidth
                        placeholder={t("data type.placeholder")}
                        variant={"filled"}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={save} color="primary">Update changes</Button>
            <Button onClick={close} color="primary">Cancel</Button>
        </DialogActions>

        <DialogContent dividers>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                    <LanguageStringFallback from={attribute?.psmHumanLabel} fallback={<Typography color={"textSecondary"}>{t("no humanLabel")}</Typography>}>
                        {(text, lang) =>
                            <Typography><strong>{t("humanLabel")} [{lang}]: </strong> {text}</Typography>
                        }
                    </LanguageStringFallback>
                    <LanguageStringFallback from={attribute?.psmHumanDescription} fallback={<Typography color={"textSecondary"}>{t("no humanDescription")}</Typography>}>
                        {(text, lang) =>
                            <Typography><strong>{t("humanDescription")} [{lang}]: </strong> {text}</Typography>
                        }
                    </LanguageStringFallback>
                </Grid>
                <Grid item xs={3} style={{textAlign: "right"}}>
                    <Button onClick={psmLabelDialog.open} color="primary">Update</Button>
                </Grid>
            </Grid>
            <LabelDescriptionEditor isOpen={psmLabelDialog.isOpen} close={psmLabelDialog.close} data={psmLabelsData} update={psmUpdateLabels} />
        </DialogContent>

        <DialogContent>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={6}>
                    <Typography>
                        {interpretation ?
                            <CheckIcon style={{verticalAlign: "middle", color: "green"}} /> :
                            <ClearIcon style={{verticalAlign: "middle", color: "red"}} />}
                        {' '}
                        {t('attribute is interpreted.' + (interpretation ? 'yes' : 'no'))}
                    </Typography>
                </Grid>
                <Grid item xs={6} style={{textAlign: "right"}}>
                    <Button disabled={!interpretation} onClick={undefined} color="primary">{t('button go to interpretation')}</Button>
                </Grid>
            </Grid>
        </DialogContent>
    </Dialog>;
};
