import { WdPropertyDescOnly, isWdErrorResponse } from "@dataspecer/wikidata-experimental-adapter";
import { DialogParameters, dialog } from "../../../dialog";
import { DialogTitle, DialogContent, Box, CircularProgress, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CloseDialogButton } from "../../detail/components/close-dialog-button";
import React, { useContext } from "react";
import { WikidataAdapterContext } from "../../wikidata/wikidata-adapter-context";
import { WdSearchPropertiesConfig } from "@dataspecer/wikidata-experimental-adapter/lib/wikidata-ontology-connector/api-types/post-experimental-search";
import { WikidataSearchResultsList } from "./wikidata-search-results-list";
import { WikidataSearchNotice } from "./helpers/wikidata-search-notice";

const DEFAULT_PROPERTY_SEARCH_CONFIG: WdSearchPropertiesConfig = {
    query: {
        text: "",
    },
    candidateSelectorConfig: {
        id: "elastic_bm25",
        maxResults: 30
    }
}

export interface WikidataPropertySearchDialogProps {
    onSelect: (WdProperty: WdPropertyDescOnly) => void;
}

const useDebounceEffect = (effect: () => void, delay: number, debounceDeps: any[]) => {
    React.useEffect(() => {
        const handler = setTimeout(effect, delay);
        return () => clearTimeout(handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, debounceDeps);
}

export const WikidataPropertySearchDialog: React.FC<DialogParameters & WikidataPropertySearchDialogProps>
    = dialog({maxWidth: "md", fullWidth: true, PaperProps: { sx: { height: "90%" } }}, ({close, onSelect}) => {
    const adapterContext = useContext(WikidataAdapterContext);
    const {t} = useTranslation("search-dialog");
    const [results, setResults] = React.useState<WdPropertyDescOnly[] | null>(null);
    const [searchConfig, setSearchConfig] = React.useState<WdSearchPropertiesConfig>(DEFAULT_PROPERTY_SEARCH_CONFIG);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);

    useDebounceEffect(() => {
        setError(false);
        if (searchConfig.query.text != null && searchConfig.query.text !== "") {
            setIsLoading(true);
            adapterContext.wdAdapter.wdOntologyConnector.postSearchProperties(searchConfig).then(response => {
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
    }, 150, [searchConfig.query.text])

    return ( 
        <>
            <DialogTitle>
                {t("wikidata.title property")}
                <CloseDialogButton onClick={close} />
            </DialogTitle>
            <DialogContent>
                <Box display={"flex"}>
                    <TextField
                        placeholder={t("wikidata.property input")}
                        fullWidth
                        autoFocus
                        onChange={e => { 
                            const newPropertyQuery = {...searchConfig.query, text: e.target.value}
                            setSearchConfig({...searchConfig, query: newPropertyQuery}) 
                        }}
                        error={isError}
                        variant={"standard"}
                        autoComplete="off"
                        value={searchConfig.query.text}
                        helperText={ isError ? t("wikidata.search error") : ""}
                    />
                    <CircularProgress style={{marginLeft: "1rem"}} size={30} value={0} variant={isLoading ? "indeterminate" : "determinate"}/>
                </Box>
                
                {results && results.length !== 0 &&
                    <WikidataSearchResultsList<WdPropertyDescOnly> 
                        results={results} 
                        onSelect={(wdProperty: WdPropertyDescOnly) => {
                            onSelect(wdProperty);
                            close()
                        }} 
                    />
                }
                {results && results.length === 0 && 
                    <WikidataSearchNotice key={"nothing"} isProgress={false} isError={false} message={t("info panel nothing found")}/>
                }
                {!results  && <WikidataSearchNotice key={"start"} isProgress={false} isError={false} message={t("info panel start typing")}/>}
            </DialogContent>
        </>
    )
});