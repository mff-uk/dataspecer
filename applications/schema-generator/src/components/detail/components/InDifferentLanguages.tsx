import React, {memo, useCallback, useMemo} from "react";
import {Button, Card, CardContent, Grid, Typography} from "@mui/material";
import {LanguageString} from "@model-driven-data/core/core";
import {useResource} from "../../../hooks/useResource";
import {PimClass} from "@model-driven-data/core/pim/model";
import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {SetPimLabelAndDescription} from "../../../operations/set-pim-label-and-description";
import {DialogAppProviderContext} from "../../dialog-app-provider";
import {StoreContext} from "../../App";
import {SetDataPsmLabelAndDescription} from "../../../operations/set-data-psm-label-and-description";
import {useTranslation} from "react-i18next";

interface Properties {
    label: LanguageString,
    description: LanguageString,

    // The IRI of the resource at which the user can change translations. If null, no button is shown
    iri?: string,
    resourceType?: "pim" | "dataPsm",
}

/**
 * This component shows human label and description in all languages based on provided label and description. This is
 * used by other components that know from which resources should be the translations extracted.
 *
 * Furthermore, if iri is provided, user is able to change a label and description of this specified iri of type
 * resourceType. Therefore the parent component may also decide which resource is editable in this simplified form.
 */
export const InDifferentLanguages: React.FC<Properties> = memo(({label, description, resourceType, iri}) => {
    const {store} = React.useContext(StoreContext);
    const {updateLabels} = React.useContext(DialogAppProviderContext);
    const {t} = useTranslation("detail");

    const languages = useMemo(() => {
        const languages = [...new Set([...Object.keys(label), ...Object.keys(description)])];
        return Object.fromEntries(languages.map(language => [language, {
            label: label[language],
            description: description[language],
        }]))
    }, [label, description]);

    const resource = useResource(iri ?? null);
    const currentLabel = (resourceType === "pim") ? (resource.resource as PimClass)?.pimHumanLabel : (resource.resource as DataPsmClass)?.dataPsmHumanLabel;
    const currentDescription = (resourceType === "pim") ? (resource.resource as PimClass)?.pimHumanDescription : (resource.resource as DataPsmClass)?.dataPsmHumanDescription;

    const onEditTranslations = useCallback(() => {
        updateLabels({
            data: {
                label: currentLabel ?? {},
                description: currentDescription ?? {},
            },
            update: data => iri && (store.executeOperation((resourceType === "pim") ?
                new SetPimLabelAndDescription(iri, data.label, data.description) :
                new SetDataPsmLabelAndDescription(iri, data.label, data.description))
            ),
        });
    }, [iri, currentLabel, currentDescription, resourceType, store, updateLabels]);

    return <>
        <Typography variant="subtitle1" component="h2">
            {t('in all languages')}
        </Typography>

        {Object.keys(languages).map(language =>
            <Card sx={{mt: 1}} key={language}>
                <CardContent>
                    <Grid container>
                        <Grid item sx={{flexGrow: 1}}>
                            <Typography variant="h6" component="div">
                                {languages[language].label}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography
                                sx={{fontSize: 14}}
                                color="text.secondary"
                                gutterBottom
                            >
                                {language}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Typography variant="body2">
                        {languages[language].description}
                    </Typography>
                </CardContent>
            </Card>
        )}

        {Object.keys(languages).length === 0 &&
            <Typography
                variant="body1"
                color="textSecondary"
                sx={{mt: 1}}
                align="center"
            >
                {t('no translations')}
            </Typography>
        }

        {Object.keys(languages).length > 0 &&
        <Typography
            variant="body1"
            color="textSecondary"
            sx={{mt: 1}}
            align="center"
        >
            {t('some translations other sources')}
        </Typography>
        }

        {resource.resource && <Button
            sx={{ml: "auto", mt: 1}}
            style={{display: "block"}}
            variant="contained"
            fullWidth
            onClick={onEditTranslations}
        >
            {t('button modify translations')}
        </Button>}
    </>;
});
