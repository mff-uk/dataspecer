import { WdClassDescOnly, WdEntityDescOnly, WdPropertyDescOnly, isWdEntityPropertyDesc, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter";
import { DialogParameters, dialog } from "../../../dialog";
import { DialogTitle, DialogContent, Box, CircularProgress, TextField, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CloseDialogButton } from "../../detail/components/close-dialog-button";
import React, { useContext } from "react";
import { WikidataAdapterContext } from "../../wikidata/wikidata-adapter-context";
import { WdPropertySearchRerankersIds, WdSearchPropertiesConfig, WdSearchRerankerConfig } from "@dataspecer/wikidata-experimental-adapter/wikidata-ontology-connector";
import { WikidataSearchResultsList } from "./wikidata-search-results-list";
import { WikidataSearchNotice } from "./helpers/wikidata-search-notice";
import { WikidataSearchBoostSlider } from "./helpers/wikidata-search-boost-slider";
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';

const MAX_INPUT_LENGTH = 50;

const DEFAULT_PROPERTY_SEARCH_CONFIG: WdSearchPropertiesConfig = {
    query: {
        text: "",
    },
    candidateSelectorConfig: {
        id: "elastic_bm25",
        maxResults: 30
    }
}

const create_usage_boost_config = (usageBoost: number): WdSearchRerankerConfig<WdPropertySearchRerankersIds> => {
    return {
        id: "feature_usage_mappings",
        maxResults: 30,
        queryWeight: (1 - usageBoost),
        featureWeights: [0.5]
    }
}

export interface WikidataPropertySearchDialogProps {
    onWdPropertySelect: (wdProperty: WdPropertyDescOnly) => void;
    onWdClassSelect: (wdClass: WdClassDescOnly) => void;
}

const useDebounceEffect = (effect: () => void, delay: number, debounceDeps: any[]) => {
    React.useEffect(() => {
        const handler = setTimeout(effect, delay);
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, debounceDeps);
}

export const WikidataPropertySearchDialog: React.FC<DialogParameters & WikidataPropertySearchDialogProps>
    = dialog({maxWidth: "md", fullWidth: true, PaperProps: { sx: { height: "90%" } }}, ({close, onWdPropertySelect, onWdClassSelect}) => {
    const adapterContext = useContext(WikidataAdapterContext);
    const {t} = useTranslation("search-dialog");
    const [usageBoost, setUsageBoost] = React.useState<number>(0);
    const [results, setResults] = React.useState<WdPropertyDescOnly[] | null>(null);
    const [searchConfig, setSearchConfig] = React.useState<WdSearchPropertiesConfig>(DEFAULT_PROPERTY_SEARCH_CONFIG);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);

    useDebounceEffect(() => {
        setError(false);
        if (searchConfig.query.text != null && searchConfig.query.text !== "") {
            setIsLoading(true);
            const config = {...searchConfig}
            if (usageBoost !== 0) {
                config.rerankerConfig = [create_usage_boost_config(usageBoost)]
            }
            console.log(config);
            adapterContext.wdAdapter.wdOntologyConnector.postSearchProperties(config).then(response => {
                if (isWdErrorResponse(response)) {
                    setError(true);
                } else {
                    setResults(response.results);
                }
            }).catch(error => {
                console.info("Error during property search.", error);
                setError(true);
            }).finally(() => setIsLoading(false));
        } else {
            setResults(null);
        }
    }, 150, [usageBoost, searchConfig.query.text])

    return (
        <>
            <DialogTitle>
                {t("wikidata.title property")}
                <CloseDialogButton onClick={close} />
            </DialogTitle>
            <DialogContent>
                <Typography fontSize={20}>{t("wikidata.property description")}:</Typography>
                <Stack direction="column" marginTop={1} marginLeft={2} marginRight={2}>
                    <Box display={"flex"}>
                        <TextField
                            placeholder={t("wikidata.property input")}
                            fullWidth
                            onChange={e => {
                                const newPropertyQuery = {...searchConfig.query, text: e.target.value}
                                setSearchConfig({...searchConfig, query: newPropertyQuery})
                            }}
                            error={isError}
                            autoComplete="off"
                            value={searchConfig.query.text}
                            inputProps={{maxLength: MAX_INPUT_LENGTH}}
                        />
                        <CircularProgress style={{marginLeft: "1rem"}} size={30} value={0} variant={isLoading ? "indeterminate" : "determinate"}/>
                    </Box>
                    <Typography sx={{marginLeft: 2, color: "#818181"}} fontSize={13}>{searchConfig.query.text.length.toString()}/{MAX_INPUT_LENGTH.toString()}</Typography>

                    <WikidataSearchBoostSlider infoText={t("wikidata.boost properties")} tooltipText={t("wikidata.boost properties tooltip")} onChange={(value: number) => setUsageBoost(value)} />
                </Stack>
                <Stack direction={"row"} alignItems="center">
                <Typography marginTop={1} marginRight={3} fontSize={20}>{t("wikidata.search results")}:</Typography>
                { isError &&
                    <Stack direction="row" marginTop={1}>
                        <ReportGmailerrorredOutlinedIcon color="error"/>
                        <Typography color="error" fontSize={17}>{t("wikidata.search error")}</Typography>
                    </Stack>
                }
                </Stack>
                {results && results.length !== 0 &&
                    <WikidataSearchResultsList<WdPropertyDescOnly>
                    results={results}
                    onSelect={(wdProperty: WdPropertyDescOnly) => {
                        onWdPropertySelect(wdProperty);
                        close()
                    }}
                    detailOnSelect={(wdEntity: WdEntityDescOnly) => {
                        if (isWdEntityPropertyDesc(wdEntity)) {
                            onWdPropertySelect(wdEntity);
                        } else {
                            onWdClassSelect(wdEntity)
                        }
                        close();
                    }}
                    detailOnSelectButtonText={(wdEntity: WdEntityDescOnly) => {
                            if (isWdEntityPropertyDesc(wdEntity)) {
                                return t("wikidata.select property");
                            } else return t("wikidata.select as root");
                        }}
                        detailOnSelectDiabledWhen={(wdEntity: WdEntityDescOnly) => false}
                    />
                }
                {results && results.length === 0 &&
                    <WikidataSearchNotice key={"nothing"} isProgress={false} isError={false} height={150} message={t("info panel nothing found")}/>
                }
                {!results  && !isError && <WikidataSearchNotice key={"start"} isProgress={false} isError={false} height={150} message={t("info panel start typing")}/>}
                {!results && isError && <WikidataSearchNotice key={"error"} isProgress={false} isError={true} height={150} />}
            </DialogContent>
        </>
    )
});