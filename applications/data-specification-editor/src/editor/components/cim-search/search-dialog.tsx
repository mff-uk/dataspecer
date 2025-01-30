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
import { isWikidataAdapter } from "@dataspecer/wikidata-experimental-adapter";
import { PrefixIriProvider } from "@dataspecer/core/cim";
import { PimClass } from "@dataspecer/core/pim/model/pim-class";
import { transformCoreResources } from "@dataspecer/core-v2/semantic-model/v1-adapters";

const identityIriProvider = new PrefixIriProvider();

export const SearchDialog: React.FC<DialogParameters & { selected: (cls: any) => void }> = dialog(
  { maxWidth: "md", fullWidth: true, PaperProps: { sx: { height: "90%" } } },
  (props) => {
    const { sourceSemanticModel } = React.useContext(ConfigurationContext);
    const { t } = useTranslation("search-dialog");

    // @ts-ignore
    const unwrappedAdapter = sourceSemanticModel?.model?.cimAdapter ?? {};

    const selectWrapped = (foundClass: PimClass) => {
      const transformed = transformCoreResources({ [foundClass.iri as string]: foundClass });
      props.selected(transformed[foundClass.iri as string]);
    };

    return (
      <>
        <DialogTitle>
          {t("title")}
          <CloseDialogButton onClick={props.close} />
        </DialogTitle>
        <DialogContent>
          {isWikidataAdapter(unwrappedAdapter) ? (
            <WikidataAdapterContext.Provider value={{ iriProvider: identityIriProvider, wdAdapter: unwrappedAdapter }}>
              <QueryClientProvider client={wikidataSearchQueryClient}>
                {/* @ts-ignore */}
                <WikidataSearchDialogContent {...props} selected={selectWrapped} />
              </QueryClientProvider>
            </WikidataAdapterContext.Provider>
          ) : (
            <DefaultSearchDialogContent {...props} />
          )}
        </DialogContent>
      </>
    );
  }
);
