import React from "react";
import {PimClass} from "@dataspecer/core/pim/model";
import {ConfigurationContext} from "../App";
import {dialog, DialogParameters} from "../../dialog";
import { isWikidataAdapter } from "@dataspecer/wikidata-experimental-adapter";
import { DefaultSearchDialogContent } from "./default-search-dialog-content/default-search-dialog-content";
import { WikidataAdapterContext } from "../wikidata/wikidata-adapter-context";
import { WikidataSearchDialogContent } from "./wikidata-search-dialog-content/wikidata-search-dialog-content";
import {DialogContent, DialogTitle} from "@mui/material";
import {CloseDialogButton} from "../detail/components/close-dialog-button";
import { useTranslation } from "react-i18next";
import { QueryClientProvider } from "react-query";
import { wikidataSearchQueryClient } from "./wikidata-search-dialog-content/wikidata-search-query-client";

export const SearchDialog: React.FC<DialogParameters & {selected: (cls: PimClass) => void}>
    = dialog({maxWidth: "md", fullWidth: true, PaperProps: { sx: { height: "90%" } }}, (props) => {
        const {cim} = React.useContext(ConfigurationContext);
        const {t} = useTranslation("search-dialog");

    return ( 
        <>
            <DialogTitle>
                {t("title")}
                <CloseDialogButton onClick={props.close} />
            </DialogTitle>
            <DialogContent>
                { 
                    isWikidataAdapter(cim.cimAdapter) 
                    ? 
                        <WikidataAdapterContext.Provider
                            value={{ iriProvider: cim.iriProvider, wdAdapter: cim.cimAdapter }}
                        >
                            <QueryClientProvider client={wikidataSearchQueryClient}>
                                <WikidataSearchDialogContent {...props} />
                            </QueryClientProvider>
                        </WikidataAdapterContext.Provider>
                    :
                    <DefaultSearchDialogContent {...props} />
                }
            </DialogContent>
        </>
    )
});
