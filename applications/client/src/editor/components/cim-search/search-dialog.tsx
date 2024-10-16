import { DialogContent, DialogTitle } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { QueryClientProvider } from "react-query";
import { dialog, DialogParameters } from "../../dialog";
import { ConfigurationContext } from "../App";
import { CloseDialogButton } from "../detail/components/close-dialog-button";
import { WikidataAdapterContext } from "../wikidata/wikidata-adapter-context";
import { DefaultSearchDialogContent } from "./default-search-dialog-content/default-search-dialog-content";
import { WikidataSearchDialogContent } from "./wikidata-search-dialog-content/wikidata-search-dialog-content";
import { wikidataSearchQueryClient } from "./wikidata-search-dialog-content/wikidata-search-query-client";

export const SearchDialog: React.FC<DialogParameters & {selected: (cls: any) => void}>
    = dialog({maxWidth: "md", fullWidth: true, PaperProps: { sx: { height: "90%" } }}, (props) => {
        // @ts-ignore
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
                    // isWikidataAdapter(cim.cimAdapter)
                    false
                    ? 
                        <WikidataAdapterContext.Provider
                            value={{ iriProvider: cim.iriProvider, wdAdapter: cim.cimAdapter }}
                        >
                            <QueryClientProvider client={wikidataSearchQueryClient}>
                                {/* @ts-ignore */}
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
