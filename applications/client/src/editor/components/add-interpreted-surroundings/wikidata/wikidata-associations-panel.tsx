import { WdClassSurroundings, WdEntityId, WdFilterByInstance } from "@dataspecer/wikidata-experimental-adapter";
import { Button, Checkbox, FormControlLabel, FormGroup, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { WikidataAssociations } from "./wikidata-associations/wikidata-associations";
import { WikidataLoadedAssociations } from "./wikidata-associations/wikidata-loaded-associations";
import { useState } from "react";
import { useDialog } from "../../../dialog";
import { WikidataFilterByInstanceDialog } from "./wikidata-associations/wikidata-filter-by-instance-dialog";


export interface WikidataAssociationsPanelProperties {
    selectedWdClassId: WdEntityId;
    rootWdClassSurroundings: WdClassSurroundings;
}

export const WikidataAssociationsPanel: React.FC<WikidataAssociationsPanelProperties> = ({selectedWdClassId, rootWdClassSurroundings}) => {
    const {t} = useTranslation("interpretedSurrounding");
    const WdFilterByInstanceDialog = useDialog(WikidataFilterByInstanceDialog, ["setWdFilterByInstance"]); 
    const [includeInheritedProperties, setIncludeInheritedProperties] = useState(false);
    const [wdFilterByInstance, setWdFilterByInstance] = useState<WdFilterByInstance | undefined>(undefined);
    const [searchText, setSearchText] = useState('');
    
    const rootWdClassIsSelected = selectedWdClassId === rootWdClassSurroundings.startClassId;
    const isInstanceFilterEmpty = wdFilterByInstance == null;
    return (
        <>
            <Typography variant="subtitle1" component="h2">{t('associations attributes')}</Typography>
                <Stack direction="column" spacing={0.4} marginBottom={0.4}>
                    <TextField
                        placeholder={t("type to search")}
                        style={{width: 247}}
                        onChange={e => {
                            e.stopPropagation();
                            setSearchText(e.target.value);
                        }}
                        variant={"standard"}
                        autoComplete="off"
                        value={searchText}
                    />
                <Stack flexDirection="row" alignItems="center">
                    <FormGroup>
                        <FormControlLabel control={
                                <Checkbox 
                                    size="small" 
                                    onChange={(e) =>  { 
                                        e.stopPropagation();
                                        setIncludeInheritedProperties(e.target.checked);
                                    }}
                                />
                            } 
                            label={t("include inherited")}/>
                    </FormGroup>
                    <Button 
                        style={{maxWidth: '230px', maxHeight: '30px', minWidth: '230px', minHeight: '30px'}} 
                        size="small" 
                        color={isInstanceFilterEmpty ? "primary" : "error"}
                        variant="contained"
                        onClick={() => isInstanceFilterEmpty ? WdFilterByInstanceDialog.open({}) : setWdFilterByInstance(undefined)}
                    >
                        {isInstanceFilterEmpty ? t("add filter by instance") : t("remove filter by instance")}
                    </Button>
                </Stack>
            </Stack>
            {rootWdClassIsSelected ? (
                <WikidataAssociations
                selectedWdClassSurroundings={rootWdClassSurroundings}
                wdFilterByInstance={wdFilterByInstance}
                searchText={searchText}
                includeInheritedProperties={includeInheritedProperties}
                />
            ) : (
                <WikidataLoadedAssociations
                selectedWdClassId={selectedWdClassId}
                wdFilterByInstance={wdFilterByInstance}
                searchText={searchText}
                includeInheritedProperties={includeInheritedProperties}
                />
            )}
            <WdFilterByInstanceDialog.Component setWdFilterByInstance={setWdFilterByInstance} />
        </>
    );
}