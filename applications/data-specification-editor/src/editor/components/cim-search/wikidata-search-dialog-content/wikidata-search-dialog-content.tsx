import { PimClass } from "@dataspecer/core/pim/model/pim-class";
import { DialogParameters } from "../../../dialog";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormControlLabel, FormControl, FormLabel, Radio, RadioGroup, Stack } from "@mui/material";
import { WikidataClassSearchConfigurable } from "./wikidata-class-search-configurable";
import { WdSearchClassesConfig } from "@dataspecer/wikidata-experimental-adapter/wikidata-ontology-connector";

// The config must be copied inside the ClassConfigurableSearch.
const METHOD_A_SEARCH_CONFIG: WdSearchClassesConfig = {
    query: {
        text: "",
        properties: []
    },
    fusionCandidateSelectorConfig: {
        id: "fusion",
        maxResults: 30,
        fusionWeights: [0.4, 0.5, 0.1],
        candidateSelectors: [
            {
                id: "qdrant_dense",
                maxResults: 100,
            },
            {
                id: "qdrant_sparse",
                maxResults: 100,
            },{
                id: "elastic_bm25",
                maxResults: 100,
            }
        ]
    }
}

// The config must be copied inside the ClassConfigurableSearch.
const METHOD_B_SEARCH_CONFIG: WdSearchClassesConfig = {
    query: {
        text: "",
        properties: []
    },
    fusionCandidateSelectorConfig: {
        id: "fusion",
        maxResults: 30,
        fusionWeights: [0.4, 0.6],
        candidateSelectors: [
            {
                id: "qdrant_dense",
                maxResults: 100,
            },
            {
                id: "qdrant_sparse",
                maxResults: 100,
            }
        ]
    }
}

type ConfigRadioType = "A" | "B";

export const WikidataSearchDialogContent: React.FC<DialogParameters & {selected: (cls: PimClass) => void}> = (props) => {
    const {t} = useTranslation("search-dialog");
    const [radioValue, setRadioValue] = React.useState<ConfigRadioType>("A")

    return (
        <>
            <FormControl sx={{marginBottom: 2}}>
                <Stack direction="row" display="flex" alignItems="center" spacing={2}>

                    <FormLabel id="wd-search-method-selection">{t("wikidata.method selection")}:</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="wd-search-method-selection"
                        name="wd-search-method-selection-name"
                        value={radioValue}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setRadioValue((event.target as HTMLInputElement).value as ConfigRadioType)
                        }}
                    >
                        <FormControlLabel value="A" control={<Radio size="small" />} label={`${t("wikidata.metod config")} A`} />
                        <FormControlLabel value="B" control={<Radio size="small" />} label={`${t("wikidata.metod config")} B`} />
                    </RadioGroup>
                </Stack>
            </FormControl>
            {/**To clear the form when switching */}
            {radioValue === "A" && <WikidataClassSearchConfigurable key={"wd-search-method-a"} {...props} searchConfig={METHOD_A_SEARCH_CONFIG} />}
            {radioValue !== "A" && <WikidataClassSearchConfigurable key={"wd-search-method-b"} {...props} searchConfig={METHOD_B_SEARCH_CONFIG} />}
        </>
    )
}
