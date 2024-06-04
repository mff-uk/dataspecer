import { PimClass } from "@dataspecer/core/pim/model/pim-class";
import { DialogParameters } from "../../../dialog";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormGroup, FormControlLabel, Switch } from "@mui/material";
import { DefaultSearchDialogContent } from "../default-search-dialog-content/default-search-dialog-content";
import { WikidataClassSearchConfigurable } from "./wikidata-class-search-configurable";

export const WikidataSearchDialogContent: React.FC<DialogParameters & {selected: (cls: PimClass) => void}> = (props) => {
    const {t} = useTranslation("search-dialog");
    const [useDefaultSearch, setUseDefaultSearch] = React.useState<boolean>(true);

    return (
        <>
            <FormGroup sx={{marginBottom: 2}}>
                <FormControlLabel control={
                    <Switch 
                        defaultChecked 
                        inputProps={{ 'aria-label': 'controlled' }} 
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUseDefaultSearch(event.target.checked)}/>} 
                        label={t("wikidata.use default")} 
                    />
            </FormGroup>
            {useDefaultSearch && <DefaultSearchDialogContent {...props} />}
            {!useDefaultSearch && <WikidataClassSearchConfigurable {...props} />}
        </>
    )
}
