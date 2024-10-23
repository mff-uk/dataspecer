import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box, CircularProgress, IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isSourceSemanticModelSearchableSync } from "../../../configuration/configuration";
import { DialogParameters, useDialog } from "../../../dialog";
import { ConfigurationContext } from "../../App";
import { PimClassDetailDialog } from "../../detail/pim-class-detail-dialog";
import { translateFrom } from "../../helper/LanguageStringComponents";
import { SlovnikGovCzGlossary } from "../../slovnik.gov.cz/SlovnikGovCzGlossary";

const MAX_RESULTS = 30;

const useDebounceEffect = (effect: () => void, delay: number, debounceDeps: any[]) => {
    useEffect(() => {
        const handler = setTimeout(effect, delay);
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, debounceDeps);
}

export const DefaultSearchDialogContent: React.FC<DialogParameters & {selected: (cls: SemanticModelClass) => void}> = ({close, isOpen, selected}) => {
    const {sourceSemanticModel} = React.useContext(ConfigurationContext);
    const [findResults, updateFindResults] = useState<SemanticModelClass[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [isError, setError] = useState(false);
    const {t, i18n} = useTranslation("search-dialog");

    const [searchText, setSearchText] = useState("");

    const DetailDialog = useDialog(PimClassDetailDialog);

    useDebounceEffect(() => {
        setError(false);
        if (searchText) {
            setLoading(true);
            sourceSemanticModel.search(searchText).then(result => {
                updateFindResults(result.filter((_, i) => i < MAX_RESULTS));
            }).catch(error => {
                console.info("Error during search.", error);
                setError(true);
            }).finally(() => setLoading(false));
        } else {
            updateFindResults(null);
        }
    }, isSourceSemanticModelSearchableSync(sourceSemanticModel) ? 0 : 100, [searchText, sourceSemanticModel]);

    return (
        <>
            <Box display={"flex"}>
                <TextField
                    placeholder={t("placeholder")}
                    fullWidth
                    autoFocus
                    onChange={e => setSearchText(e.target.value)}
                    error={isError}
                    variant={"standard"}
                    autoComplete="off"
                    value={searchText}
                    />
                <CircularProgress style={{marginLeft: "1rem"}} size={30} value={0} variant={loading ? "indeterminate" : "determinate"}/>
            </Box>
            <List dense component="nav"
                sx={{
                    overflow: 'auto',
                    maxHeight: 500,
                    height: 500,
                    margin: theme => theme.spacing(2, 0, 0, 0),
                }}
                >
                {findResults && findResults.map((result: SemanticModelClass) =>
                    <ListItem button key={result.id} onClick={() => {
                        selected(result);
                        close();
                    }}>
                        <ListItemText secondary={<Typography variant="body2" color="textSecondary" noWrap
                                                                title={translateFrom(result.name, i18n.languages)}>{translateFrom(result.description, i18n.languages)}</Typography>}>
                            <strong>{translateFrom(result.name, i18n.languages)}</strong>
                            {" "}
                            <SlovnikGovCzGlossary cimResourceIri={result.iri as string}/>
                        </ListItemText>
                        <IconButton onClick={e => {
                            e.stopPropagation();
                            DetailDialog.open({iri: result.iri as string})
                        }}>
                            <InfoTwoToneIcon/>
                        </IconButton>
                    </ListItem>
                )}

                {(!findResults || findResults.length === 0) &&
                <Box sx={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: (theme) => theme.palette.grey[500],
                    flexDirection: "column",
                }}>
                    {!findResults && <><SearchIcon sx={{display: "block", height: "4rem", width: "4rem"}} />{t('info panel start typing')}</>}
                    {findResults && <><SearchOffIcon sx={{display: "block", height: "4rem", width: "4rem"}} />{t('info panel nothing found')}</>}
                </Box>}
            </List>
            <DetailDialog.Component />
        </>
    );
}